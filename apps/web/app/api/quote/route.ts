import { NextResponse } from "next/server";
import { calculateQuote } from "@colae/pricing";
export async function POST(request:Request){
 try{const body=await request.json();return NextResponse.json(calculateQuote({product:String(body.product),material:String(body.material),width:Number(body.width),height:Number(body.height),quantity:Number(body.quantity),finish:String(body.finish)}));}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Dados inválidos."},{status:400});}
}
