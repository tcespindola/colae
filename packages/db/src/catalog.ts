import postgres from "postgres";
import { databaseConfigured } from "./index";

export type CatalogItem = { id: string; name: string; value: number; active: boolean };
export type CatalogSnapshot = {
  products: CatalogItem[];
  materials: CatalogItem[];
  finishes: CatalogItem[];
  dies: CatalogItem[];
  quantityTiers: Array<{ id: string; minQuantity: number; factor: number; active: boolean }>;
};

const normalizeItems = (rows: any[]): CatalogItem[] =>
  rows.map((row) => ({ id: row.id, name: row.name, value: Number(row.value), active: Boolean(row.active) }));

export async function getCatalog(): Promise<CatalogSnapshot> {
  if (!databaseConfigured()) return { products: [], materials: [], finishes: [], dies: [], quantityTiers: [] };
  const url = process.env.DATABASE_URL;
  if (!url) return { products: [], materials: [], finishes: [], dies: [], quantityTiers: [] };
  const sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 5 });
  try {
    const [products, materials, finishes, dies, quantityTiers] = await Promise.all([
      sql`select id, name, setup as value, active from products order by name`,
      sql`select id, name, price_per_m2 as value, active from materials order by name`,
      sql`select id, name, price_per_m2 as value, active from finishes order by name`,
      sql`select id, name, price as value, active from dies order by name`,
      sql`select id, min_quantity as "minQuantity", factor, active from quantity_tiers order by min_quantity desc`
    ]);
    return {
      products: normalizeItems(products),
      materials: normalizeItems(materials),
      finishes: normalizeItems(finishes),
      dies: normalizeItems(dies),
      quantityTiers: quantityTiers.map((row: any) => ({
        id: row.id,
        minQuantity: Number(row.minQuantity),
        factor: Number(row.factor),
        active: Boolean(row.active)
      }))
    };
  } finally { await sql.end(); }
}