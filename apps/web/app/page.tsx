"use client";
import { useMemo, useState } from "react";
type Quote={subtotal:number;setup:number;total:number;unitPrice:number};
const products=[{id:"label",name:"Etiqueta adesiva"},{id:"sticker",name:"Sticker personalizado"}];
const materials=[{id:"bopp-white",name:"BOPP branco"},{id:"paper-kraft",name:"Papel kraft"},{id:"paper-white",name:"Papel branco"}];
const finishes=[{id:"none",name:"Sem acabamento"},{id:"matte",name:"Laminação fosca"},{id:"gloss",name:"Laminação brilho"}];
export default function Home(){
 const [product,setProduct]=useState("label"),[material,setMaterial]=useState("bopp-white"),[width,setWidth]=useState(50),[height,setHeight]=useState(30),[quantity,setQuantity]=useState(1000),[finish,setFinish]=useState("none"),[quote,setQuote]=useState<Quote|null>(null),[loading,setLoading]=useState(false);
 const area=useMemo(()=>width*height,[width,height]);
 async function calculate(){setLoading(true);setQuote(null);try{const r=await fetch("/api/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({product,material,width,height,quantity,finish})});if(!r.ok)throw new Error("Não foi possível calcular o orçamento.");setQuote(await r.json());}finally{setLoading(false);}}
 return <main className="page"><header className="header"><div className="brand">COLAE<span>.</span></div><div className="badge">MVP • orçamento instantâneo</div></header>
 <section className="hero"><p className="eyebrow">SUA MARCA COMEÇA NOS DETALHES</p><h1>Crie suas etiquetas.<br/><em>Veja o preço na hora.</em></h1><p className="lead">Configure material, tamanho, quantidade e acabamento. O cálculo é processado com segurança no servidor.</p></section>
 <section className="grid"><div className="card form">
 <Step number="01" title="Produto"><Select value={product} onChange={setProduct} options={products}/></Step>
 <Step number="02" title="Material"><Select value={material} onChange={setMaterial} options={materials}/></Step>
 <Step number="03" title="Tamanho"><div className="dimensions"><Field label="Largura (mm)" value={width} onChange={setWidth}/><Field label="Altura (mm)" value={height} onChange={setHeight}/></div><div className="hint">Área: {area.toLocaleString("pt-BR")} mm²</div></Step>
 <Step number="04" title="Quantidade"><Field label="Unidades" value={quantity} onChange={setQuantity} min={100} step={100}/><div className="chips">{[500,1000,2500,5000].map(q=><button key={q} onClick={()=>setQuantity(q)} className={quantity===q?"chip active":"chip"}>{q.toLocaleString("pt-BR")}</button>)}</div></Step>
 <Step number="05" title="Acabamento"><Select value={finish} onChange={setFinish} options={finishes}/></Step>
 <button className="calculate" onClick={calculate} disabled={loading}>{loading?"Calculando...":"Calcular meu orçamento →"}</button></div>
 <aside className="card result"><div className="result-top"><span>ESTIMATIVA</span><span className="dot"/></div>{quote?<><p className="result-label">Total estimado</p><div className="price">R$ {quote.total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div><p className="unit">R$ {quote.unitPrice.toLocaleString("pt-BR",{minimumFractionDigits:2})} / unidade</p><div className="breakdown"><Row label="Produção" value={quote.subtotal}/><Row label="Preparação" value={quote.setup}/></div><button className="secondary">Solicitar orçamento completo</button></>:<div className="empty"><div className="orb">C</div><h2>Seu orçamento<br/>aparece aqui.</h2><p>Preencha as opções ao lado para descobrir uma estimativa.</p></div>}</aside></section></main>;
}
function Step({number,title,children}:{number:string;title:string;children:React.ReactNode}){return <div className="step"><div className="step-title"><span>{number}</span><strong>{title}</strong></div>{children}</div>}
function Select({value,onChange,options}:{value:string;onChange:(value:string)=>void;options:{id:string;name:string}[]}){return <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>}
function Field({label,value,onChange,min=1,step=1}:{label:string;value:number;onChange:(value:number)=>void;min?:number;step?:number}){return <label className="field"><span>{label}</span><input type="number" min={min} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>}
function Row({label,value}:{label:string;value:number}){return <div className="row"><span>{label}</span><strong>R$ {value.toLocaleString("pt-BR",{minimumFractionDigits:2})}</strong></div>}
