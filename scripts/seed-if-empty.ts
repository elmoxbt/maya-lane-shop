/**
 * Runs the demo seed only when the database has no products yet.
 * Used by `npm run vercel-build` so a fresh deployment gets demo data,
 * while later deploys never touch existing data. Set SKIP_DEMO_SEED=true to disable.
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  if (process.env.SKIP_DEMO_SEED === "true") return console.log("Demo seed skipped (SKIP_DEMO_SEED=true).");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const products = await db.product.count();
  await db.$disconnect();
  if (products > 0) return console.log(`Database already has ${products} products; skipping demo seed.`);
  console.log("Empty database detected; seeding demo store…");
  execSync("npx prisma db seed", { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
