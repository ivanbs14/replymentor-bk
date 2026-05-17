# ReplyMentor Backend

API NestJS do MVP do ReplyMentor.

## Stack da feature

- NestJS + TypeScript
- PostgreSQL + Prisma
- STT: Whisper local / faster-whisper via endpoint OpenAI-compatible (`/v1/audio/transcriptions`)
- LLM: Gemini / Ollama / OpenAI (selecionável por request)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/replymentor?schema=public"
LLM_PROVIDER="gemini"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.0-flash"
GEMINI_ALLOWED_MODELS="gemini-2.0-flash"
OPENAI_API_KEY=""
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_ALLOWED_MODELS="gpt-4.1-mini"
OLLAMA_API_KEY=""
OLLAMA_BASE_URL="http://localhost:11434/v1"
OLLAMA_MODEL="llama3.1:8b"
OLLAMA_ALLOWED_MODELS="llama3.1:8b"
LLM_TIMEOUT_MS="45000"
WHISPER_BASE_URL="http://localhost:8000"
WHISPER_MODEL="Systran/faster-whisper-large-v3"
WHISPER_API_KEY=""
PORT="3001"
```

`generate-response` aceita `provider` (`gemini`, `ollama`, `openai`) e `model` opcional.
Se `model` for enviado, ele precisa estar na whitelist do provider (`*_ALLOWED_MODELS`).
`LLM_TIMEOUT_MS` controla timeout de geração para evitar requisições penduradas.

## Rodando Ollama model local
- ollama serve

## Rodando Whisper com Docker desktop
- clique em play container

## Rodando Whisper com Docker

Exemplo com `faster-whisper` OpenAI-compatible (CPU):

```bash
docker run --rm -it \
  --name replymentor-whisper \
  -p 8000:8000 \
  -v whisper-cache:/root/.cache/huggingface \
  -e WHISPER_MODEL=Systran/faster-whisper-large-v3 \
  ghcr.io/fedirz/faster-whisper-server:latest-cpu
```

Opcional (GPU NVIDIA):

```bash
docker run --rm -it \
  --gpus all \
  --name replymentor-whisper \
  -p 8000:8000 \
  -v whisper-cache:/root/.cache/huggingface \
  -e WHISPER_MODEL=Systran/faster-whisper-large-v3 \
  ghcr.io/fedirz/faster-whisper-server:latest-cuda
```

Depois confirme:

```bash
curl http://localhost:8000/docs
```

Com isso, mantenha no `.env`:

- `WHISPER_BASE_URL="http://localhost:8000"`
- `WHISPER_MODEL="Systran/faster-whisper-large-v3"`
- `WHISPER_API_KEY=""` (vazio, se não configurar autenticação no container)

## Execução

```bash
npm install
npm run build
npm run start:dev
```

## Testes

```bash
npm run test -- --watchman=false
```

## Fluxo atendido

1. Recebe trecho manual (`transcript`) ou áudio (`audioBase64`)
2. Transcreve áudio no Whisper/faster-whisper local
3. Detecta pergunta mais recente
4. Gera resposta com Gemini em JSON estruturado
5. Persiste resposta e resumo de sessão
