import {
  createRunningQualityGateSummary,
  runAndPersistQualityGate,
  runQuestionDetectionQualityGate,
  writeJsonAtomically,
  type AtomicWriteDependencies,
  type QualityGateRunner,
} from '../../scripts/run-question-detection-quality-gate';

describe('runQuestionDetectionQualityGate', () => {
  const backendCwd = '/workspace/replymentor-backend';
  const webCwd = '/workspace/replymentor-web';

  it('runs every blocking check in order and returns a sanitized summary', () => {
    const invocations: Parameters<QualityGateRunner>[] = [];
    const run: QualityGateRunner = (command, args, cwd) => {
      invocations.push([command, args, cwd]);
      return { status: 0 };
    };
    const timestamps = [
      '2026-10-25T10:00:00.000Z',
      '2026-10-25T10:00:01.000Z',
      '2026-10-25T10:00:02.000Z',
      '2026-10-25T10:00:03.000Z',
      '2026-10-25T10:00:04.000Z',
      '2026-10-25T10:00:05.000Z',
      '2026-10-25T10:00:06.000Z',
      '2026-10-25T10:00:07.000Z',
      '2026-10-25T10:00:08.000Z',
      '2026-10-25T10:00:09.000Z',
    ];

    const result = runQuestionDetectionQualityGate({
      run,
      backendCwd,
      webCwd,
      now: () => timestamps.shift()!,
    });

    expect(invocations).toEqual([
      ['npm', ['run', 'corpus:evaluate:hybrid'], backendCwd],
      [
        'npm',
        [
          'test',
          '--',
          '--runInBand',
          '--no-watchman',
          'src/interview/question-detection',
        ],
        backendCwd,
      ],
      ['npm', ['run', 'test:session:integration'], backendCwd],
      [
        'npm',
        [
          'test',
          '--',
          'src/lib/api.test.ts',
          'src/lib/interview-contract.test.ts',
          'src/lib/interview-store.test.ts',
          'src/app/page.test.tsx',
        ],
        webCwd,
      ],
    ]);
    expect(result.steps.map((step) => step.name)).toEqual([
      'hybrid-corpus',
      'backend-detection',
      'backend-contracts',
      'frontend-contracts',
    ]);
    expect(result.passed).toBe(true);
    expect(result).toEqual({
      state: 'completed',
      startedAt: '2026-10-25T10:00:00.000Z',
      completedAt: '2026-10-25T10:00:09.000Z',
      steps: [
        {
          name: 'hybrid-corpus',
          outcome: 'exit',
          exitCode: 0,
          startedAt: '2026-10-25T10:00:01.000Z',
          completedAt: '2026-10-25T10:00:02.000Z',
        },
        {
          name: 'backend-detection',
          outcome: 'exit',
          exitCode: 0,
          startedAt: '2026-10-25T10:00:03.000Z',
          completedAt: '2026-10-25T10:00:04.000Z',
        },
        {
          name: 'backend-contracts',
          outcome: 'exit',
          exitCode: 0,
          startedAt: '2026-10-25T10:00:05.000Z',
          completedAt: '2026-10-25T10:00:06.000Z',
        },
        {
          name: 'frontend-contracts',
          outcome: 'exit',
          exitCode: 0,
          startedAt: '2026-10-25T10:00:07.000Z',
          completedAt: '2026-10-25T10:00:08.000Z',
        },
      ],
      passed: true,
    });
  });

  it('stops after the first failed process', () => {
    const invokedSteps: string[] = [];
    const exitCodes = [0, 0, 1];
    const run: QualityGateRunner = (_command, args) => {
      invokedSteps.push(args.join(' '));
      return { status: exitCodes.shift() ?? 0 };
    };

    const result = runQuestionDetectionQualityGate({
      run,
      backendCwd,
      webCwd,
      now: () => '2026-10-25T10:00:00.000Z',
    });

    expect(invokedSteps).toHaveLength(3);
    expect(invokedSteps).not.toContain(
      'test -- src/lib/api.test.ts src/lib/interview-contract.test.ts src/lib/interview-store.test.ts src/app/page.test.tsx',
    );
    expect(result.steps.map((step) => step.name)).toEqual([
      'hybrid-corpus',
      'backend-detection',
      'backend-contracts',
    ]);
    expect(result.steps.at(-1)?.exitCode).toBe(1);
    expect(result.passed).toBe(false);
  });

  it('records a spawn error without leaking its message and fails closed', () => {
    const run: QualityGateRunner = () => ({
      status: null,
      signal: null,
      error: new Error('secret path: /private/workspace'),
    });

    const result = runQuestionDetectionQualityGate({
      run,
      backendCwd,
      webCwd,
      now: () => '2026-10-25T10:00:00.000Z',
    });

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({
      outcome: 'spawn_error',
      exitCode: 1,
    });
    expect(JSON.stringify(result)).not.toContain('secret path');
    expect(JSON.stringify(result)).not.toContain('/private/workspace');
    expect(result.passed).toBe(false);
  });

  it('records a terminating signal and maps it to a coherent exit code', () => {
    const run: QualityGateRunner = () => ({
      status: null,
      signal: 'SIGTERM',
    });

    const result = runQuestionDetectionQualityGate({
      run,
      backendCwd,
      webCwd,
      now: () => '2026-10-25T10:00:00.000Z',
    });

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toMatchObject({
      outcome: 'signal',
      signal: 'SIGTERM',
      exitCode: 143,
    });
    expect(result.passed).toBe(false);
  });

  it('creates a fail-closed running summary before processes execute', () => {
    expect(
      createRunningQualityGateSummary(() => '2026-10-25T10:00:00.000Z'),
    ).toEqual({
      state: 'running',
      startedAt: '2026-10-25T10:00:00.000Z',
      completedAt: null,
      steps: [],
      passed: false,
    });
  });
});

describe('writeJsonAtomically', () => {
  function dependencies(
    operations: string[],
    writeImplementation?: () => void,
  ): AtomicWriteDependencies {
    return {
      makeTemporaryPath: (destination) => `${destination}.exclusive.tmp`,
      open: (path, flags, mode) => {
        operations.push(`open:${path}:${flags}:${mode.toString(8)}`);
        return 42;
      },
      write: (_fd, content) => {
        operations.push(`write:${content}`);
        writeImplementation?.();
      },
      fsync: () => operations.push('fsync'),
      close: () => operations.push('close'),
      rename: (from, to) => operations.push(`rename:${from}:${to}`),
      unlink: (path) => operations.push(`unlink:${path}`),
    };
  }

  it('writes and syncs an exclusive private temp file before renaming it', () => {
    const operations: string[] = [];

    writeJsonAtomically(
      '/generated/summary.json',
      { state: 'running', passed: false },
      dependencies(operations),
    );

    expect(operations).toEqual([
      'open:/generated/summary.json.exclusive.tmp:wx:600',
      'write:{\n  "state": "running",\n  "passed": false\n}\n',
      'fsync',
      'close',
      'rename:/generated/summary.json.exclusive.tmp:/generated/summary.json',
    ]);
  });

  it('never renames a partial temp file and cleans it up best-effort', () => {
    const operations: string[] = [];

    expect(() =>
      writeJsonAtomically(
        '/generated/summary.json',
        { passed: true },
        dependencies(operations, () => {
          throw new Error('disk full');
        }),
      ),
    ).toThrow('disk full');

    expect(operations).toEqual([
      'open:/generated/summary.json.exclusive.tmp:wx:600',
      'write:{\n  "passed": true\n}\n',
      'close',
      'unlink:/generated/summary.json.exclusive.tmp',
    ]);
    expect(operations.some((operation) => operation.startsWith('rename:'))).toBe(
      false,
    );
  });
});

describe('runAndPersistQualityGate', () => {
  it('persists a fail-closed running state before executing processes', () => {
    const events: string[] = [];
    const running = createRunningQualityGateSummary(
      () => '2026-10-25T10:00:00.000Z',
    );
    const completed = {
      state: 'completed' as const,
      startedAt: '2026-10-25T10:00:00.000Z',
      completedAt: '2026-10-25T10:00:01.000Z',
      steps: [],
      passed: false,
    };

    const result = runAndPersistQualityGate({
      reportPath: '/generated/summary.json',
      createRunningSummary: () => running,
      execute: () => {
        events.push('execute');
        return completed;
      },
      write: (_destination, summary) => {
        events.push(`write:${summary.state}:${summary.passed}`);
      },
    });

    expect(events).toEqual([
      'write:running:false',
      'execute',
      'write:completed:false',
    ]);
    expect(result).toBe(completed);
  });
});
