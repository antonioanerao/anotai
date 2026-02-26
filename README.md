# AnotAI

Projeto AnotAI: editor compartilhavel de notas/codigo com leitura publica, permissoes de edicao e autenticacao.

> Este projeto foi feito inteiramente com `Codex` da OpenAI.

## Funcionalidades MVP

- Blocos por URL (`/pads/[slug]`) com leitura publica (sem login)
- Atualizacao em tempo real via polling
- Seletor de linguagem do bloco (dono do bloco): Texto puro, Python, PHP e JavaScript
- Highlight de sintaxe no conteudo do bloco
- Edicao conforme modo de permissao do bloco
- Modo de permissao por bloco:
  - `OWNER_ONLY`: apenas o criador edita
  - `COLLABORATIVE`: qualquer usuario autenticado edita
  - `ANONYMOUS`: qualquer pessoa edita (mesmo sem login)
- Painel admin para:
  - Ligar/desligar cadastro publico (`allowPublicSignup`)
  - Definir dominios permitidos para cadastro publico
  - Criar contas mesmo com cadastro publico desligado
  - Listar usuarios cadastrados (somente leitura)
  - Listar blocos criados e seus donos
  - Excluir blocos com confirmacao
- Usuario autenticado pode alterar a propria senha (senha atual, nova e confirmacao)
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
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (reCAPTCHA v3, usado no frontend)
- `RECAPTCHA_SECRET_KEY` (reCAPTCHA v3, usado no backend)
- `RECAPTCHA_MIN_SCORE` (padrao `0.5`)

Comportamento do captcha:
- Em `development`, login e cadastro funcionam sem captcha.
- Em `production`, captcha v3 so e usado quando as chaves `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` e `RECAPTCHA_SECRET_KEY` estiverem configuradas.
- Se as chaves nao estiverem informadas, login e cadastro seguem sem captcha.

Observacao: no Compose, `DATABASE_URL` eh montada automaticamente a partir dessas variaveis.  
Para rodar local com `npm run dev`, use `DATABASE_URL` apontando para `localhost`.
Se quiser sobrescrever a URL interna do servico `app` no Docker Compose, use `DOCKER_DATABASE_URL`.

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
5. Usuarios anonimos acompanham e copiam; no modo `ANONYMOUS`, tambem podem editar.
