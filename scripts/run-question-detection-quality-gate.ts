import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { constants as osConstants } from 'node:os';
import { randomUUID } from 'node:crypto';

type QualityGateStepName =
  | 'hybrid-corpus'
  | 'backend-detection'
  | 'backend-contracts'
  | 'frontend-contracts';

type QualityGateStepDefinition = {
  name: QualityGateStepName;
  command: string;
  args: string[];
  cwd: string;
};

type QualityGateProcessResult = {
  status: number | null;
  signal?: NodeJS.Signals | null;
  error?: Error;
};

export type QualityGateRunner = (
  command: string,
  args: string[],
  cwd: string,
) => QualityGateProcessResult;

type QualityGateStepSummary = {
  name: QualityGateStepName;
  outcome: 'exit' | 'signal' | 'spawn_error';
  exitCode: number;
  signal?: NodeJS.Signals;
  startedAt: string;
  completedAt: string;
};

export type CompletedQualityGateSummary = {
  state: 'completed';
  startedAt: string;
  completedAt: string;
  steps: QualityGateStepSummary[];
  passed: boolean;
};

export type RunningQualityGateSummary = {
  state: 'running';
  startedAt: string;
  completedAt: null;
  steps: [];
  passed: false;
};

export type QualityGateSummary =
  | RunningQualityGateSummary
  | CompletedQualityGateSummary;

type QualityGateDependencies = {
  run: QualityGateRunner;
  backendCwd: string;
  webCwd: string;
  now: () => string;
};

export type AtomicWriteDependencies = {
  makeTemporaryPath: (destination: string) => string;
  open: (path: string, flags: 'wx', mode: number) => number;
  write: (fd: number, content: string) => void;
  fsync: (fd: number) => void;
  close: (fd: number) => void;
  rename: (from: string, to: string) => void;
  unlink: (path: string) => void;
};

const defaultAtomicWriteDependencies: AtomicWriteDependencies = {
  makeTemporaryPath: (destination) =>
    `${destination}.${process.pid}.${randomUUID()}.tmp`,
  open: (path, flags, mode) => openSync(path, flags, mode),
  write: (fd, content) => writeFileSync(fd, content, 'utf8'),
  fsync: (fd) => fsyncSync(fd),
  close: (fd) => closeSync(fd),
  rename: (from, to) => renameSync(from, to),
  unlink: (path) => unlinkSync(path),
};

const defaultRunner: QualityGateRunner = (command, args, cwd) =>
  spawnSync(command, args, {
    cwd,
    shell: false,
    stdio: 'inherit',
  });

function defaultDependencies(): QualityGateDependencies {
  const backendCwd = resolve(__dirname, '..');
  return {
    run: defaultRunner,
    backendCwd,
    webCwd: resolve(backendCwd, '..', 'replymentor-web'),
    now: () => new Date().toISOString(),
  };
}

function buildSteps(
  backendCwd: string,
  webCwd: string,
): QualityGateStepDefinition[] {
  return [
    {
      name: 'hybrid-corpus',
      command: 'npm',
      args: ['run', 'corpus:evaluate:hybrid'],
      cwd: backendCwd,
    },
    {
      name: 'backend-detection',
      command: 'npm',
      args: [
        'test',
        '--',
        '--runInBand',
        '--no-watchman',
        'src/interview/question-detection',
      ],
      cwd: backendCwd,
    },
    {
      name: 'backend-contracts',
      command: 'npm',
      args: ['run', 'test:session:integration'],
      cwd: backendCwd,
    },
    {
      name: 'frontend-contracts',
      command: 'npm',
      args: [
        'test',
        '--',
        'src/lib/api.test.ts',
        'src/lib/interview-contract.test.ts',
        'src/lib/interview-store.test.ts',
        'src/app/page.test.tsx',
      ],
      cwd: webCwd,
    },
  ];
}

function processOutcome(
  result: QualityGateProcessResult,
): Pick<QualityGateStepSummary, 'outcome' | 'exitCode' | 'signal'> {
  if (result.error) {
    return { outcome: 'spawn_error', exitCode: 1 };
  }
  if (result.signal) {
    const signalNumber = (osConstants.signals as Record<string, number>)[
      result.signal
    ];
    return {
      outcome: 'signal',
      signal: result.signal,
      exitCode: signalNumber ? 128 + signalNumber : 1,
    };
  }
  if (result.status === null) {
    return { outcome: 'spawn_error', exitCode: 1 };
  }
  return { outcome: 'exit', exitCode: result.status };
}

export function createRunningQualityGateSummary(
  now: () => string = () => new Date().toISOString(),
): RunningQualityGateSummary {
  return {
    state: 'running',
    startedAt: now(),
    completedAt: null,
    steps: [],
    passed: false,
  };
}

export function writeJsonAtomically(
  destination: string,
  value: unknown,
  dependencies: AtomicWriteDependencies = defaultAtomicWriteDependencies,
): void {
  const temporaryPath = dependencies.makeTemporaryPath(destination);
  let fd: number | undefined;
  try {
    fd = dependencies.open(temporaryPath, 'wx', 0o600);
    dependencies.write(fd, `${JSON.stringify(value, null, 2)}\n`);
    dependencies.fsync(fd);
    dependencies.close(fd);
    fd = undefined;
    dependencies.rename(temporaryPath, destination);
  } catch (error: unknown) {
    if (fd !== undefined) {
      try {
        dependencies.close(fd);
      } catch {
        // Cleanup is best-effort; preserve the original failure.
      }
    }
    try {
      dependencies.unlink(temporaryPath);
    } catch {
      // The destination was never truncated; an absent temp file is harmless.
    }
    throw error;
  }
}

type PersistedGateDependencies = {
  reportPath: string;
  createRunningSummary: () => RunningQualityGateSummary;
  execute: () => CompletedQualityGateSummary;
  write: (destination: string, summary: QualityGateSummary) => void;
};

export function runAndPersistQualityGate({
  reportPath,
  createRunningSummary,
  execute,
  write,
}: PersistedGateDependencies): CompletedQualityGateSummary {
  write(reportPath, createRunningSummary());
  const summary = execute();
  write(reportPath, summary);
  return summary;
}

export function runQuestionDetectionQualityGate(
  dependencies: QualityGateDependencies = defaultDependencies(),
): CompletedQualityGateSummary {
  const { run, backendCwd, webCwd, now } = dependencies;
  const startedAt = now();
  const steps: QualityGateStepSummary[] = [];

  for (const definition of buildSteps(backendCwd, webCwd)) {
    const stepStartedAt = now();
    const processResult = run(
      definition.command,
      definition.args,
      definition.cwd,
    );
    const outcome = processOutcome(processResult);
    steps.push({
      name: definition.name,
      ...outcome,
      startedAt: stepStartedAt,
      completedAt: now(),
    });

    if (outcome.exitCode !== 0) break;
  }

  return {
    state: 'completed',
    startedAt,
    completedAt: now(),
    steps,
    passed: steps.length === 4 && steps.every((step) => step.exitCode === 0),
  };
}

function main(): void {
  const backendCwd = resolve(__dirname, '..');
  const generatedDirectory = resolve(backendCwd, 'generated');
  mkdirSync(generatedDirectory, { recursive: true });
  const reportPath = resolve(
    generatedDirectory,
    'feat-020-gate-summary.json',
  );
  const summary = runAndPersistQualityGate({
    reportPath,
    createRunningSummary: () => createRunningQualityGateSummary(),
    execute: () => runQuestionDetectionQualityGate(),
    write: writeJsonAtomically,
  });
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.passed) {
    process.exitCode = summary.steps.at(-1)?.exitCode ?? 1;
  }
}

if (require.main === module) {
  try {
    main();
  } catch {
    console.error('Question detection quality gate failed.');
    process.exitCode = 1;
  }
}
