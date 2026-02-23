# Dotpad Copia

Clone funcional do DontPad usando Next.js + Tailwind + Auth.js + Prisma + PostgreSQL.

## Funcionalidades MVP

- Blocos por URL (`/pads/[slug]`) com leitura publica (sem login)
- Atualizacao em tempo real via polling
- Seletor de linguagem do bloco (dono do bloco): Texto puro, Python, PHP e JavaScript
- Highlight de sintaxe no conteudo do bloco
- Edicao apenas para autenticados
- Modo de permissao por bloco:
  - `OWNER_ONLY`: apenas o criador edita
  - `COLLABORATIVE`: qualquer usuario autenticado edita
- Painel admin para:
  - Ligar/desligar cadastro publico (`allowPublicSignup`)
  - Criar contas mesmo com cadastro publico desligado
- Admin primario por `.env` (`PRIMARY_ADMIN_EMAIL`)

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores.

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `PRIMARY_ADMIN_EMAIL`

## Rodar localmente (sem Docker)

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

## Rodar com Docker

```bash
docker compose up --build
```

Aplicacao: `http://localhost:3000`

## Fluxo basico

1. Crie uma conta (se cadastro publico estiver habilitado).
2. Faça login.
3. Crie um pad com slug e escolha o modo de edicao.
4. Compartilhe a URL do pad.
5. Usuarios anonimos acompanham e copiam; usuarios autenticados editam conforme permissao.
