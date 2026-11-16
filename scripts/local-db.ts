/**
 * Zero-install local Postgres for development, powered by PGlite (Postgres compiled to WASM).
 * Use it when you don't have Docker or a Neon/Supabase database handy:
 *
 *   npm run db:local          # keep this running in its own terminal
 *   DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable&connection_limit=1"
 *
 * Data is persisted in ./.pglite. For production use Neon or Supabase.
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.LOCAL_DB_PORT ?? 5433);

async function main() {
  const db = await PGlite.create("./.pglite");
  const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  console.log(`▶ Local Postgres (PGlite) listening on 127.0.0.1:${port}`);

  const shutdown = async () => {
    await server.stop();
    await db.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
