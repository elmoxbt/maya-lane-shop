import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate, studio) uses the direct connection when one is provided.
// Neon/Supabase: DATABASE_URL = pooled URL, DIRECT_URL (or Neon's DATABASE_URL_UNPOOLED) = direct URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Neon via Vercel provides DATABASE_URL_UNPOOLED; Supabase/others: set DIRECT_URL.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL,
  },
});
