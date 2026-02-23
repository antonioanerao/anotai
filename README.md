# AnotAI

Projeto AnotAI: editor compartilhavel de notas/codigo com leitura publica, permissoes de edicao e autenticacao.

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

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_HOST` (em Docker Compose, normalmente `db`)
- `DB_SCHEMA` (normalmente `public`)
- `DB_PORT`
- `APP_PORT`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `PRIMARY_ADMIN_EMAIL`

Observacao: no Compose, `DATABASE_URL` eh montada automaticamente a partir dessas variaveis.  
Voce pode definir `DATABASE_URL` manualmente apenas se quiser sobrescrever esse comportamento.

## Rodar localmente (sem Docker)

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

## Rodar com Docker

Crie um compose local a partir do exemplo:

```bash
cp docker-compose.example.yml docker-compose.yml
```

Depois suba os servicos:

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
