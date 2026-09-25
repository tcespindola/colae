"use client";
import { useEffect, useState } from "react";
type Quote = { id:string; input:Record<string,unknown>; quote:{breakdown?:{total?:number;unitPrice?:number}; assumptions?:string[]}; createdAt:string };
export default function PublicQuote({params}:{params:Promise<{id:string}>}){
 const [data,setData]=useState<Quote|null>(null); const [error,setError]=useState("");
 useEffect(()=>{params.then(({id})=>fetch(`/api/quotes/${id}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setData(d)}).catch(e=>setError(e.message)))},[params]);
 if(error)return <main className="page"><div className="card result"><h1>Orçamento indisponível</h1><p>{error}</p></div></main>;
 if(!data)return <main className="page"><div className="card result"><p>Carregando orçamento…</p></div></main>;
 const total=Number(data.quote.breakdown?.total??0);
 return <main className="page"><header className="header"><div className="brand">COLAE<span>.</span></div><div className="badge">ORÇAMENTO</div></header><section className="hero"><p className="eyebrow">ORÇAMENTO COLAE</p><h1>Seu projeto.<br/><em>Do jeito certo.</em></h1><p className="lead">Orçamento #{data.id.slice(0,8)} · {new Date(data.createdAt).toLocaleDateString("pt-BR")}</p></section><div className="card result"><span>TOTAL ESTIMADO</span><div className="price">R$ {total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div><p>Dimensão: {String(data.input.widthMm)} × {String(data.input.heightMm)} mm · Quantidade: {String(data.input.quantity)}</p><p>Este valor é uma estimativa sujeita à confirmação comercial.</p></div></main>;
}
