# Setup Supabase

Progetto Supabase: **rutbtpqvcxzyorboosep**  
Dashboard: https://supabase.com/dashboard/project/rutbtpqvcxzyorboosep

Hilde usa **PostgreSQL** via [Supabase](https://supabase.com).

## MCP in Cursor (opzionale)

Il file `.cursor/mcp.json` è già configurato con il tuo project ref.

1. **Cursor Settings → MCP** → verifica che `supabase` sia attivo (toggle verde)
2. Se non lo è, clicca **Connect** e fai login su Supabase nel browser
3. In una nuova chat puoi chiedere: *"usa Supabase MCP per eseguire la migration init"*

Se il MCP non è connesso, segui i passi manuali sotto.

## 1. Connection string

In [Project Settings → Database](https://supabase.com/dashboard/project/rutbtpqvcxzyorboosep/settings/database):

| Variabile | Tipo in Supabase | Porta |
|-----------|------------------|-------|
| `DATABASE_URL` | **Session** pooler | 5432 |

Esempio (Vercel — basta questa):

```env
DATABASE_URL=postgresql://postgres.rutbtpqvcxzyorboosep:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

> Sostituisci `[PASSWORD]` con la password del database e verifica la **region** (es. `eu-central-1`) nel dashboard — potrebbe essere diversa.

## 3. Applica le migration

In locale (con le variabili Supabase nel `.env`):

```bash
npm run migrate
```

Oppure incolla lo SQL da `prisma/migrations/20250101000000_init/migration.sql` nel **SQL Editor** di Supabase.

## 4. Variabili su Vercel

In **Vercel → Project → Settings → Environment Variables**:

| Variabile | Valore |
|-----------|--------|
| `DATABASE_URL` | Session pooler (5432) |
| `ADMIN_PASSWORD` | Password admin `/admin` |
| `NEXTAUTH_SECRET` | Stringa random lunga |
| `NEXTAUTH_URL` | `https://tuo-progetto.vercel.app` |

Al deploy, Vercel esegue `prisma migrate deploy` automaticamente (vedi script `build`).

## 5. Primo accesso

1. Apri `/admin` e inserisci `ADMIN_PASSWORD`
2. Crea e **attiva** una stagione
3. Registra la prima partita

## Sviluppo locale (senza Supabase)

```bash
docker-compose up -d    # PostgreSQL su localhost:5432
cp .env.example .env    # se non hai già un .env
npm run migrate
npm run dev
```
