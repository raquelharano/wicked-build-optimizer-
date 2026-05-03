# Wicked Build Optimizer

Recomendador de builds para **No Rest for the Wicked**. Selecione o tipo de arma e seus atributos preferidos — o app retorna até 5 builds completas e explicadas automaticamente.

> Projeto open source, gratuito e sem necessidade de login.

---

## O que o app faz

- Filtra por tipo de arma, atributos, elemento e facets
- Recomenda entre 1 e 5 builds viáveis com scores calculados
- Explica como jogar cada build e por que ela funciona
- Mostra pontos fortes, fracos e nível de dificuldade
- Dados atualizados semanalmente a partir de norestforthewicked.gg

## Stack

- **Frontend + API:** Next.js (App Router) + TailwindCSS
- **Banco de dados:** PostgreSQL via Supabase ou Railway
- **ORM:** Prisma
- **Cache:** Redis via Upstash
- **Deploy:** Vercel

## Rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/wicked-build-optimizer.git
cd wicked-build-optimizer

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do banco de dados

# 4. Gere o cliente Prisma e aplique o schema
npx prisma generate
npx prisma migrate dev

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Banco de dados gratuito

**Supabase (recomendado):** supabase.com → novo projeto → Settings → Database → copie a connection string → cole no `.env` como `DATABASE_URL`

**Railway:** railway.app → novo projeto → PostgreSQL → copie a connection string → cole no `.env`

## Deploy no Vercel

1. Push do código para o GitHub
2. Importe o repositório em vercel.com
3. Configure as variáveis de ambiente no painel
4. Deploy automático a cada push na `main`

## Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

## Licença

MIT — use, modifique e distribua livremente.

---

*Dados: norestforthewicked.gg*
