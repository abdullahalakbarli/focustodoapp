import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[server/db] DATABASE_URL is not set. Backend auth endpoints will not be able to reach the database."
  );
}

export const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 30_000,
});

export const db = {
  query: (text, params) => pool.query(text, params),
  oneOrNone: async (text, params) => {
    const { rows } = await pool.query(text, params);
    return rows[0] ?? null;
  },
  none: async (text, params) => {
    await pool.query(text, params);
  },
  tx: async (fn) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn({
        query: (text, params) => client.query(text, params),
        oneOrNone: async (text, params) => {
          const { rows } = await client.query(text, params);
          return rows[0] ?? null;
        },
        none: async (text, params) => {
          await client.query(text, params);
        },
      });
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};


