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
      sql\`select id, name, setup as value, active from products order by name\`,
      sql\`select id, name, price_per_m2 as value, active from materials order by name\`,
      sql\`select id, name, price_per_m2 as value, active from finishes order by name\`,
      sql\`select id, name, price as value, active from dies order by name\`,
      sql\`select id, min_quantity as "minQuantity", factor, active from quantity_tiers order by min_quantity desc\`
    ]);
    return {
      products: normalizeItems(products),
      materials: normalizeItems(materials),
      finishes: normalizeItems(finishes),
      dies: normalizeItems(dies),
      quantityTiers: quantityTiers.map((row: any) => ({
        id: row.id, minQuantity: Number(row.minQuantity), factor: Number(row.factor), active: Boolean(row.active)
      }))
    };
  } finally { await sql.end(); }
}

export async function updateCatalog(catalog: CatalogSnapshot) {
  if (!databaseConfigured()) throw new Error("DATABASE_URL ainda não foi configurada.");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ainda não foi configurada.");
  const sql = postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 5 });
  try {
    await sql.begin(async (tx) => {
      for (const item of catalog.products) {
        await tx\`update products set name=\${item.name}, setup=\${item.value}, active=\${item.active} where id=\${item.id}\`;
      }
      for (const item of catalog.materials) {
        await tx\`update materials set name=\${item.name}, price_per_m2=\${item.value}, active=\${item.active} where id=\${item.id}\`;
      }
      for (const item of catalog.finishes) {
        await tx\`update finishes set name=\${item.name}, price_per_m2=\${item.value}, active=\${item.active} where id=\${item.id}\`;
      }
      for (const item of catalog.dies) {
        await tx\`update dies set name=\${item.name}, price=\${item.value}, active=\${item.active} where id=\${item.id}\`;
      }
      for (const tier of catalog.quantityTiers) {
        await tx\`update quantity_tiers set min_quantity=\${tier.minQuantity}, factor=\${tier.factor}, active=\${tier.active} where id=\${tier.id}\`;
      }
    });
  } finally { await sql.end(); }
}
