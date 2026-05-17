import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const seededUser = {
  email: 'demo@replymentor.app',
  password: 'ReplyMentor@123',
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

const resumeText = `
Ivan Barbosa da Silva - Full Stack (Fortaleza/CE)

Resumo profissional:
Engenheiro de Software Full Stack com experiencia em React, Next.js, NestJS, TypeScript e PostgreSQL.
Atuacao end-to-end em frontend, backend e banco de dados, com foco em APIs REST, arquitetura modular,
escalabilidade, qualidade de codigo e integracoes em nuvem.

Stack principal:
- Frontend: React, Next.js, Tailwind CSS, Styled Components
- Backend: NestJS, Node.js, Express, APIs REST, DTO validation, JWT, Swagger/OpenAPI
- Dados: PostgreSQL, Prisma, TypeORM
- Cloud/DevOps: AWS, Docker, CI/CD, Git, GitLab CI
- IA/LLM: Azure OpenAI, OpenAI APIs, automacoes e extracao/classificacao de dados

Experiencia recente:
- LongView Tecnologia (Jun/2025 - Atual): desenvolvimento full stack com Next.js + NestJS + PostgreSQL,
  evolucao de APIs REST, melhorias de desempenho/escalabilidade, CI/CD, integracoes AWS (S3/Lambda)
  e solucoes com IA para suporte ao cliente e automacao interna.
- Hausey (Out/2024 - Mai/2025): atuacao como Tech Lead e Full Stack, apoiando decisoes arquiteturais,
  padroes de engenharia e entregas com foco em manutencao e escalabilidade.
`.trim();

const jobDescription = `
Projeto para construir uma nova plataforma cloud integrada que substitui um sistema legado do Rituaali.

Escopo principal:
- Operacao interna
- Hotelaria
- Reservas
- Modulo clinico
- Agendamento
- App mobile do hospede
- Futura camada de acompanhamento continuo de saude

Diretrizes tecnicas esperadas:
- Arquitetura moderna e escalavel
- Abordagem API-first
- Preparacao para integracoes com sistemas terceiros
- Preparacao para uso de IA

Sugestao de stack/arquitetura considerada aderente:
- Frontend web: Next.js + TypeScript
- Mobile: React Native
- Backend: NestJS + TypeScript
- Banco: PostgreSQL
- ORM: Prisma
- Estrategia: monolito modular por dominio no inicio, com possibilidade de extracao de servicos no crescimento
`.trim();

async function main() {
  const passwordHash = await hashPassword(seededUser.password);
  const user = await prisma.user.upsert({
    where: { email: seededUser.email },
    update: {
      passwordHash,
    },
    create: {
      email: seededUser.email,
      passwordHash,
    },
  });

  const context = await prisma.interviewContext.create({
    data: {
      userId: user.id,
      resumeText,
      interviewType: 'Técnica (Coding/System Design)',
      jobLevel: 'Sênior',
      jobDescription,
      companyName: 'Rituaali',
      companySegment:
        'Plataforma de operacao/hotelaria com modulo clinico, agendamento e jornada digital do hospede, com roadmap de saude continua e IA.',
      responsePreference: 'equilibrada',
      aiBehavior:
        'Quero que voce haja como se fosse o entrevistado e responda em primeira pessoa, com tom profissional, objetivo e confiante.',
    },
  });

  console.log('InterviewContext seeded with id:', context.id);
  console.log('Seeded login credentials:');
  console.log(`  email: ${seededUser.email}`);
  console.log(`  password: ${seededUser.password}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
