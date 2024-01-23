import { Kysely, PostgresDialect } from "kysely";

import { DB } from "@typesDef/db.d";
import { Pool } from "pg";
import dotenv from "dotenv";

// this is the Database interface we defined earlier

dotenv.config();

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
});
