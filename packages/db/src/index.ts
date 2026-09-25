import postgres from "postgres";

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "expired";
export type StoredQuote = { id:string; customerId:string|null; status:QuoteStatus; input:Record<string,unknown>; quote:Record<string,unknown>; createdAt:string; updatedAt:string };
export type Customer = { id:string; name:string; email:string|null; phone:string|null; company:string|null; createdAt:string };

function client(){const url=process.env.DATABASE_URL;return url?postgres(url,{max:5,idle_timeout:20,connect_timeout:5}):null;}
export async function saveQuote(id:string,input:Record<string,unknown>,quote:Record<string,unknown>,customer?:Partial<Customer>){
 const sql=client();if(!sql)return false;
 try{let customerId:string|null=null;
  if(customer?.name){customerId=customer.id??crypto.randomUUID();await sql`insert into customers (id,name,email,phone,company) values (${customerId},${customer.name},${customer.email??null},${customer.phone??null},${customer.company??null}) on conflict (id) do update set name=excluded.name,email=excluded.email,phone=excluded.phone,company=excluded.company`;}
  await sql`insert into quotes (id,customer_id,status,input,quote) values (${id},${customerId},"draft",${sql.json(JSON.stringify(input))},${sql.json(JSON.stringify(quote))})`;
  return true;
 }finally{await sql.end();}
}
export async function getQuote(id:string):Promise<StoredQuote|null>{const sql=client();if(!sql)return null;try{const rows=await sql`select id,customer_id as "customerId",status,input,quote,created_at as "createdAt",updated_at as "updatedAt" from quotes where id=${id} limit 1`;return rows[0]?(rows[0] as unknown as StoredQuote):null;}finally{await sql.end();}}
export async function listQuotes(limit=50):Promise<StoredQuote[]>{const sql=client();if(!sql)return [];try{const rows=await sql`select id,customer_id as "customerId",status,input,quote,created_at as "createdAt",updated_at as "updatedAt" from quotes order by created_at desc limit ${Math.min(Math.max(limit,1),100)}`;return rows as unknown as StoredQuote[];}finally{await sql.end();}}
export async function updateQuoteStatus(id:string,status:QuoteStatus){const sql=client();if(!sql)return false;try{const rows=await sql`update quotes set status=${status},updated_at=now() where id=${id} returning id`;return Boolean(rows[0]);}finally{await sql.end();}}
export function databaseConfigured(){return Boolean(process.env.DATABASE_URL);}