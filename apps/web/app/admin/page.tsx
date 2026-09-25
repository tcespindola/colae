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
 {catalog&&<>{<Table title="Produtos" items={catalog.products} unit="unit"/>}<Table title="Materiais" items={catalog.materials} unit="m²"/><Table title="Acabamentos" items={catalog.finishes} unit="m²"/><Table title="Facas" items={catalog.dies} unit="unit"/>
 <section className="admin-section"><div className="admin-section-head"><h2>Faixas de quantidade</h2><span>{catalog.quantityTiers.length} regras</span></div><div className="admin-table"><div className="admin-row admin-head"><span>Mínimo</span><span>Fator</span><span>Status</span></div>{catalog.quantityTiers.map(t=><div className="admin-row" key={t.id}><span><strong>{t.minQuantity.toLocaleString("pt-BR")} unidades</strong><small>{t.id}</small></span><span>{Number(t.factor).toFixed(2)}×</span><span className={t.active?"status active":"status"}>{t.active?"Ativo":"Inativo"}</span></div>)}</div></section></>}
 <footer className="admin-footer">COLAE • painel interno • próxima etapa: edição autenticada do catálogo</footer></main>;
}