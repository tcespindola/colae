import fs from "node:fs";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL não configurada; schema não aplicado.");
  process.exit(0);
}
const sql = postgres(process.env.DATABASE_URL);
const schema = fs.readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
await sql.unsafe(schema);
await sql.end();
console.log("Schema COLAE aplicado.");
