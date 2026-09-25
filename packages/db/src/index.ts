import postgres from "postgres";

export type StoredQuote = {
  id: string;
  input: Record<string, unknown>;
  quote: Record<string, unknown>;
  createdAt: string;
};

function client() {
  const url = process.env.DATABASE_URL;
  return url ? postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 5 }) : null;
}

export async function saveQuote(id: string, input: Record<string, unknown>, quote: Record<string, unknown>) {
  const sql = client();
  if (!sql) return false;
  try {
    await sql`insert into quotes (id, input, quote) values (${id}, ${sql.json(JSON.stringify(input))}, ${sql.json(JSON.stringify(quote))})`;
    return true;
  } finally {
    await sql.end();
  }
}

export async function getQuote(id: string): Promise<StoredQuote | null> {
  const sql = client();
  if (!sql) return null;
  try {
    const rows = await sql`select id, input, quote, created_at as "createdAt" from quotes where id = ${id} limit 1`;
    if (!rows[0]) return null;
    return rows[0] as unknown as StoredQuote;
  } finally {
    await sql.end();
  }
}

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
