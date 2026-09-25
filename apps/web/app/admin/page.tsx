"use client";
import { useEffect, useState } from "react";

type Item={id:string;name:string;value:number;active:boolean};
type Tier={id:string;minQuantity:number;factor:number;active:boolean};
type Catalog={products:Item[];materials:Item[];finishes:Item[];dies:Item[];quantityTiers:Tier[]};
const money=(v:number)=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function Table({title,items,unit}:{title:string;items:Item[];unit:string}){
 return <section className="admin-section"><div className="admin-section-head"><h2>{title}</h2><span>{items.length} itens</span></div><div className="admin-table">
  <div className="admin-row admin-head"><span>Nome</span><span>Parâmetro</span><span>Status</span></div>
  {items.map(i=><div className="admin-row" key={i.id}><span><strong>{i.name}</strong><small>{i.id}</small></span><span>{unit==="m²"?money(i.value)+" / m²":money(i.value)}</span><span className={i.active?"status active":"status"}>{i.active?"Ativo":"Inativo"}</span></div>)}
 </div></section>;
}

export default function AdminPage(){
 const[catalog,setCatalog]=useState<Catalog|null>(null),[configured,setConfigured]=useState(true),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/catalog").then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setCatalog(d.catalog);setConfigured(d.configured)}).catch(e=>setError(e instanceof Error?e.message:"Erro ao carregar catálogo."))},[]);
 const total=catalog?catalog.products.length+catalog.materials.length+catalog.finishes.length+catalog.dies.length:0;
 return <main className="admin-page"><header className="admin-header"><a className="admin-brand" href="/">COLAE<span>.</span></a><span className="admin-badge">ADMIN • CATÁLOGO</span></header>
 <section className="admin-hero"><p className="eyebrow">CENTRAL DE OPERAÇÕES</p><h1>Catálogo e<br/><em>regras de preço.</em></h1><p>Base do backoffice da COLAE. Os parâmetros abaixo serão a fonte operacional do motor de orçamento.</p></section>
 {!configured&&<div className="admin-notice"><strong>PostgreSQL ainda não conectado.</strong><span>Configure <code>DATABASE_URL</code> para carregar e persistir o catálogo.</span></div>}
 {error&&<div className="admin-error">{error}</div>}
 <div className="admin-stats"><div><small>ITENS DO CATÁLOGO</small><strong>{total}</strong></div><div><small>FAIXAS DE QUANTIDADE</small><strong>{catalog?.quantityTiers.length??0}</strong></div><div><small>STATUS</small><strong>{configured?"Operacional":"Aguardando DB"}</strong></div></div>
 {catalog&&<><Table title="Produtos" items={catalog.products} unit="unit"/><Table title="Materiais" items={catalog.materials} unit="m²"/><Table title="Acabamentos" items={catalog.finishes} unit="m²"/><Table title="Facas" items={catalog.dies} unit="unit"/>
 <section className="admin-section"><div className="admin-section-head"><h2>Faixas de quantidade</h2><span>{catalog.quantityTiers.length} regras</span></div><div className="admin-table"><div className="admin-row admin-head"><span>Mínimo</span><span>Fator</span><span>Status</span></div>{catalog.quantityTiers.map(t=><div className="admin-row" key={t.id}><span><strong>{t.minQuantity.toLocaleString("pt-BR")} unidades</strong><small>{t.id}</small></span><span>{Number(t.factor).toFixed(2)}×</span><span className={t.active?"status active":"status"}>{t.active?"Ativo":"Inativo"}</span></div>)}</div></section></>}
 <style>{`
.admin-page{max-width:1180px;margin:auto;padding:28px 24px 70px}.admin-header{display:flex;justify-content:space-between;align-items:center}.admin-brand{font-size:29px;font-weight:900;letter-spacing:-2px;color:var(--navy);text-decoration:none}.admin-brand span{color:var(--mint)}.admin-badge{border:1px solid #d7d9e0;padding:8px 12px;border-radius:999px;font-size:11px}.admin-hero{padding:72px 0 40px}.admin-hero h1{margin-bottom:22px}.admin-hero>p:last-child{max-width:680px;font-size:18px;line-height:1.5;color:#4b5365}.admin-notice,.admin-error{background:#fff;border:1px solid #e1e3e9;border-radius:16px;padding:16px 18px;margin-bottom:18px;display:flex;gap:8px;flex-wrap:wrap}.admin-notice code{background:var(--gray);padding:2px 6px;border-radius:5px}.admin-error{color:#b42318}.admin-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}.admin-stats>div{background:var(--navy);color:#fff;border-radius:20px;padding:22px}.admin-stats small{display:block;font-size:10px;letter-spacing:.14em;opacity:.7}.admin-stats strong{display:block;font-size:28px;margin-top:10px}.admin-section{background:#fff;border:1px solid #e1e3e9;border-radius:20px;margin:18px 0;overflow:hidden}.admin-section-head{display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid #e8e9ee}.admin-section-head h2{font-size:20px;margin:0;letter-spacing:-.03em}.admin-section-head span{font-size:11px;color:#737989}.admin-row{display:grid;grid-template-columns:1.5fr 1fr .6fr;gap:16px;padding:15px 22px;border-bottom:1px solid #f0f1f4;align-items:center;font-size:14px}.admin-row:last-child{border-bottom:0}.admin-row small{display:block;color:#8a90a0;font-size:11px;margin-top:3px}.admin-head{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#737989}.status{justify-self:start;border-radius:999px;padding:5px 9px;background:#f0f1f4;color:#737989;font-size:11px}.status.active{background:#e5faf6;color:#12786c}.admin-footer{padding:30px 0;color:#737989;font-size:11px;text-transform:uppercase;letter-spacing:.12em}@media(max-width:700px){.admin-stats{grid-template-columns:1fr}.admin-row{grid-template-columns:1.2fr 1fr}.admin-row>span:last-child{display:none}}
`}</style></main>;
}