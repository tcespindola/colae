import { NextRequest,NextResponse } from "next/server";
const COOKIE="colae_admin";
const token=()=>process.env.COLAE_ADMIN_KEY?Buffer.from(process.env.COLAE_ADMIN_KEY).toString("base64url"):"";
export async function POST(r:NextRequest){
 const key=process.env.COLAE_ADMIN_KEY;if(!key)return NextResponse.json({error:"COLAE_ADMIN_KEY não configurada no ambiente."},{status:503});
 const body=await r.json().catch(()=>({}));if(body.key!==key)return NextResponse.json({error:"Chave administrativa inválida."},{status:401});
 const res=NextResponse.json({ok:true});res.cookies.set(COOKIE,token(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:28800});return res;
}
export async function DELETE(){const res=NextResponse.json({ok:true});res.cookies.set(COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});return res;}