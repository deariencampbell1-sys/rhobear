#!/usr/bin/env node
// RHOBEAR Constellation Bear — Icon Factory. Composites the REAL master PNG onto a
// brand background. Never redraws the bear, never fakes a hue.
// Composition: rounded-square #0a0e13 bg (radius 22%), bear centered @70%, ~1px inner
// ring @16% product-hue opacity, optional cloud 3-star badge (top-right, hue).
// Outputs: 512/192/180/64 PNG, maskable-512, apple-touch-180, favicon.ico(16/32/48),
//          <name>.ico(16/24/32/48/64/128/256), <name>-tray.ico(16/24/32), contact sheet.
import sharp from "sharp";
import ico from "png-to-ico";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { resolve, basename } from "node:path";

const argv = process.argv.slice(2);
const CLOUD = argv.includes("--cloud");
const val = (k) => { const i = argv.indexOf("--" + k); return i >= 0 ? argv[i + 1] : undefined; };
const MASTER = resolve(val("master"));
const HUE = (val("hue") || "236c72").replace("#", "");
const NAME = val("name") || basename(MASTER, ".png").replace("rhobear-bear-", "");
const OUT = resolve(val("out") || `brand/icons/out/${NAME}`);
const BG = "#0a0e13";

const hex2rgb = (h) => [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
const [HR,HG,HB] = hex2rgb(HUE);
const hueCss = `#${HUE}`;
const hueRgba = (a) => `rgba(${HR},${HG},${HB},${a})`;

function star(cx,cy,r,rot=-90){const p=[];for(let i=0;i<10;i++){const rd=i%2===0?r:r*0.42;const a=((rot+i*36)*Math.PI)/180;p.push(`${(cx+rd*Math.cos(a)).toFixed(2)},${(cy+rd*Math.sin(a)).toFixed(2)}`);}return `<polygon points="${p.join(" ")}"/>`;}

function baseSvg(S,{maskable}){const r=maskable?0:0.22*S;const ringW=Math.max(1,Math.round(S*0.004));const inset=maskable?S*0.10:Math.max(1,Math.round(S*0.006));let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">`;s+=`<rect x="0" y="0" width="${S}" height="${S}" rx="${r}" ry="${r}" fill="${BG}"/>`;s+=`<rect x="${inset}" y="${inset}" width="${S-2*inset}" height="${S-2*inset}" rx="${Math.max(0,r-inset)}" ry="${Math.max(0,r-inset)}" fill="none" stroke="${hueRgba(0.16)}" stroke-width="${ringW}"/>`;if(CLOUD){const cx=maskable?S*0.82:S*0.84;const cy=maskable?S*0.20:S*0.16;const u=S*0.05;s+=`<g fill="${hueCss}">${star(cx,cy,u*0.9)}${star(cx-u*1.5,cy+u*1.1,u*0.6,20)}${star(cx+u*0.7,cy+u*1.7,u*0.55,60)}</g>`;}s+=`</svg>`;return s;}

// returns a PNG Buffer at size S
async function compose(S,{maskable=false}={}){
  const base = await sharp(Buffer.from(baseSvg(S,{maskable}))).ensureAlpha().png().toBuffer();
  const frac = maskable ? 0.56 : 0.70;
  const bearW = Math.round(S*frac);
  const bear = await sharp(MASTER).resize(bearW,bearW,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().png().toBuffer();
  return sharp(base).composite([{input:bear,gravity:"center",blend:"over"}]).png().toBuffer();
}

async function writeIco(sizeList,file){const bufs=await Promise.all(sizeList.map(s=>compose(s)));await writeFile(file,await ico(bufs));}

(async()=>{
  await rm(OUT,{recursive:true,force:true});await mkdir(OUT,{recursive:true});
  const PNG_SIZES=[512,192,180,64];
  for(const S of PNG_SIZES) await writeFile(`${OUT}/${NAME}-${S}.png`, await compose(S));
  await writeFile(`${OUT}/${NAME}-maskable-512.png`, await compose(512,{maskable:true}));
  await writeFile(`${OUT}/${NAME}-apple-touch-180.png`, await compose(180));
  await writeIco([16,32,48],`${OUT}/favicon.ico`);
  await writeIco([16,24,32,48,64,128,256],`${OUT}/${NAME}.ico`);
  await writeIco([16,24,32],`${OUT}/${NAME}-tray.ico`);

  // contact sheet
  const cell=256,pad=15;const sheetW=cell*3+pad*4;
  const cells=[{l:"512",S:512},{l:"192",S:192},{l:"maskable-512",S:512,m:true}];
  const thumbs=await Promise.all(cells.map(async c=>{
    const src=`${OUT}/${NAME}-${c.l}.png`;
    return {l:c.l,buf:await sharp(src).resize(cell,cell,{fit:"contain",background:"#000"}).png().toBuffer()};
  }));
  const labelSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${cell+80}" viewBox="0 0 ${sheetW} ${cell+80}"><text x="${pad}" y="26" fill="${hueCss}" font-family="monospace" font-size="16">${NAME} ${CLOUD?"(cloud)":"(local)"}  ·  hue ${hueCss}  ·  bg ${BG}</text>${thumbs.map((t,i)=>`<text x="${pad+i*(cell+pad)+4}" y="${40+cell+18}" fill="#9aa4b2" font-family="monospace" font-size="13">${t.l}</text>`).join("")}</svg>`;
  await sharp({create:{width:sheetW,height:cell+80,channels:4,background:{r:10,g:14,b:19,alpha:1}}}).composite([...thumbs.map((t,i)=>({input:t.buf,left:pad+i*(cell+pad),top:40})),{input:Buffer.from(labelSvg)}]).png().toFile(`${OUT}/_contact-sheet.png`);

  console.log(`OK ${NAME} ${CLOUD?"[cloud]":"[local]"} hue=${hueCss} -> ${OUT}`);
  console.log(`   PNG: ${PNG_SIZES.join(",")} + maskable-512 + apple-touch-180`);
  console.log(`   ICO: favicon.ico(16/32/48) ${NAME}.ico(16/24/32/48/64/128/256) ${NAME}-tray.ico(16/24/32)`);
})().catch(e=>{console.error("FACTORY ERROR:",e);process.exit(1);});
