import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate, studio) uses the direct connection when one is provided.
// Neon/Supabase: DATABASE_URL = pooled URL, DIRECT_URL = direct URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
