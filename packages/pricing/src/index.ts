export type QuoteInput={product:string;material:string;width:number;height:number;quantity:number;finish:string};
export type Quote={subtotal:number;setup:number;total:number;unitPrice:number};
const materialRate:Record<string,number>={"bopp-white":0.018,"paper-kraft":0.014,"paper-white":0.012};
const finishRate:Record<string,number>={none:0,matte:0.006,gloss:0.007};
export function calculateQuote(input:QuoteInput):Quote{
 if(!Number.isFinite(input.width)||!Number.isFinite(input.height)||input.width<=0||input.height<=0)throw new Error("Dimensões inválidas.");
 if(!Number.isInteger(input.quantity)||input.quantity<100||input.quantity>1000000)throw new Error("Quantidade deve estar entre 100 e 1.000.000.");
 const material=materialRate[input.material]; if(!material)throw new Error("Material inválido.");
 const finish=finishRate[input.finish]; if(finish===undefined)throw new Error("Acabamento inválido.");
 const areaCm2=(input.width*input.height)/100; const productFactor=input.product==="sticker"?1.12:1;
 const unit=Math.max(0.08,(areaCm2*(material+finish))*productFactor);
 const volumeDiscount=input.quantity>=5000?0.88:input.quantity>=2500?0.93:input.quantity>=1000?0.97:1;
 const subtotal=input.quantity*unit*volumeDiscount; const setup=input.product==="sticker"?35:25; const total=Number((subtotal+setup).toFixed(2));
 return{subtotal:Number(subtotal.toFixed(2)),setup,total,unitPrice:Number((total/input.quantity).toFixed(2))};
}