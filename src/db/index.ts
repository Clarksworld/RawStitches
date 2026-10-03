import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || "";
};

export const getDb = () => {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
};

// Singleton instance for serverless runtime
export const db = getDatabaseUrl()
  ? drizzle(neon(getDatabaseUrl()), { schema })
  : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

export type DB = typeof db;
export * from "./schema";
