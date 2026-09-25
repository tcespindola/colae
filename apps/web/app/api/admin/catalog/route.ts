import { NextRequest,NextResponse } from "next/server";
import { getCatalog,updateCatalog,type CatalogSnapshot } from "@colae/db/catalog";
const COOKIE="colae_admin";
const token=()=>process.env.COLAE_ADMIN_KEY?Buffer.from(process.env.COLAE_ADMIN_KEY).toString("base64url"):"";
function authorized(r:NextRequest){return Boolean(process.env.COLAE_ADMIN_KEY)&&r.cookies.get(COOKIE)?.value===token();}
export async function GET(r:NextRequest){
 if(!process.env.DATABASE_URL)return NextResponse.json({configured:false,message:"DATABASE_URL ainda não foi configurada.",catalog:{products:[],materials:[],finishes:[],dies:[],quantityTiers:[]}});
 if(!authorized(r))return NextResponse.json({error:"Não autorizado."},{status:401});
 try{return NextResponse.json({configured:true,catalog:await getCatalog()});}catch{return NextResponse.json({error:"Não foi possível carregar o catálogo."},{status:500});}
}
export async function PUT(r:NextRequest){
 if(!authorized(r))return NextResponse.json({error:"Não autorizado."},{status:401});
 try{const body=await r.json() as CatalogSnapshot;await updateCatalog(body);return NextResponse.json({ok:true,catalog:await getCatalog()});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Não foi possível salvar o catálogo."},{status:400});}
}