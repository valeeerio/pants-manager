# Pants Manager

Web app gestionale per un piccolo laboratorio artigianale che modifica, ripara e realizza pantaloni.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- Prisma ORM
- MySQL
- Docker Compose

## Stato attuale

La prima fase contiene solo UI statica con dati mock. Il database non e ancora collegato alle pagine.

## Avvio locale

```bash
npm install
npm run dev
```

Per avviare MySQL quando si iniziera l'integrazione dati:

```bash
docker compose up -d
```
