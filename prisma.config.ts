import path from "node:path";
import { defineConfig } from "prisma/config";
import 'dotenv/config'
export default defineConfig({
  // Path to your main Prisma schema file (relative to this config file)
  schema: path.join("prisma", "schema"),

  // Configuration for migrations (optional)
  migrations: {
    path: path.join("db", "migrations"),
  },

  // Configuration for database views (optional)
  views: {
    path: path.join("db", "views"),
  },

  // Configuration for TypedSQL queries (optional, preview feature)
  typedSql: {
    path: path.join("db", "queries"),
  },

  // Enable experimental features as needed (optional)
  experimental: {
    adapter: true,
    externalTables: true,
    studio: true,
  },
});