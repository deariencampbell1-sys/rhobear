#!/usr/bin/env node
// RHOBEAR installer banner generator. Dark floor + product-hue radial glow + bear left +
// wordmark right. Emits Inno WizardImageFile (164x314) + wide banner (497x120).
// Usage: node brand/install-art/banner.mjs --master <png> --hue <hex> --wordmark "RHOBEAR / Hub" --name hub-teal [--out ...]
import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { resolve, basename } from "node:path";
const argv=process.argv.slice(2);
const val=k=>{const i=argv.indexOf("--"+k);return i>=0?argv[i+1]:undefined;};
const MASTER=resolve(val("master"));
const HUE=(val("hue")||"236c72").replace("#","");
const NAME=val("name")||basename(MASTER,".png").replace("rhobear-bear-","");
const WORDMARK=val("wordmark")||NAME;
const OUT=resolve(val("out")||`brand/install-art/out/${NAME}`);
const BG="#0a0e13";
const hex2rgb=h=>[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
const [HR,HG,HB]=hex2rgb(HUE);
const hueRgba=a=>`rgba(${HR},${HG},${HB},${a})`;
function glowSvg(W,H){const cx=W*0.28,cy=H*0.5;return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="g" cx="${cx/W}" cy="${cy/H}" r="0.7"><stop offset="0%" stop-color="${hueRgba(0.55)}"/><stop offset="45%" stop-color="${hueRgba(0.16)}"/><stop offset="100%" stop-color="${BG}" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`;}
function wordmarkSvg(W,H){const [main,sub]=WORDMARK.split("/").map(s=>s.trim());const fs=Math.round(Math.min(H*0.30,W*0.12));let t=`<text x="${W*0.50}" y="${sub?H*0.45:H*0.54}" fill="#f4f7fb" font-family="'Segoe UI',Arial,sans-serif" font-weight="700" font-size="${fs}" letter-spacing="2">${main||WORDMARK}</text>`;if(sub)t+=`<text x="${W*0.50}" y="${H*0.70}" fill="${hueRgba(0.95)}" font-family="'Segoe UI',Arial,sans-serif" font-weight="600" font-size="${Math.round(fs*0.6)}">${sub}</text>`;return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${t}</svg>`;}
async function make(W,H,file){
  const glow=await sharp(Buffer.from(glowSvg(W,H))).png().toBuffer();
  const bearSize=Math.round(Math.min(W*0.82,H*0.80)); // fits the smaller dimension
  const bear=await sharp(MASTER).resize(bearSize,bearSize,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().png().toBuffer();
  const wm=await sharp(Buffer.from(wordmarkSvg(W,H))).resize(W,H,{fit:"fill"}).png().toBuffer();
  const bearLeft=Math.round(W*0.07), bearTop=Math.round((H-bearSize)/2);
  await sharp(glow).composite([{input:bear,left:bearLeft,top:bearTop,blend:"over"},{input:wm,blend:"over"}]).png().toFile(file);
}
(async()=>{
  await rm(OUT,{recursive:true,force:true});await mkdir(OUT,{recursive:true});
  await make(164,314,`${OUT}/${NAME}-installer-wizard.png`);
  await make(497,120,`${OUT}/${NAME}-installer-banner.png`);
  console.log(`OK install-art ${NAME} hue=#${HUE} -> ${OUT}`);
  console.log(`   ${NAME}-installer-wizard.png (164x314, Inno WizardImageFile)`);
  console.log(`   ${NAME}-installer-banner.png  (497x120)`);
})().catch(e=>{console.error("BANNER ERROR:",e);process.exit(1);});
