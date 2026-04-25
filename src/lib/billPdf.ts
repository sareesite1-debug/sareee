// Premium PDF / print rendering for quotations and invoices.
// GST is INCLUSIVE — total field is what was actually paid; subtotal & GST are derived.
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BRAND } from "./brand";

export interface BillItem { name: string; description?: string; quantity: number; rate: number; amount: number; }
export interface BillData {
  doc_type: "QUOTATION" | "INVOICE";
  number: string;
  date: string;
  status?: string;
  bill_type: "customer" | "supplier";
  party_name: string;
  party_email?: string;
  party_gst_no?: string;
  items: BillItem[];
  subtotal: number;
  cgst_percent: number; cgst_amount: number;
  sgst_percent: number; sgst_amount: number;
  igst_percent: number; igst_amount: number;
  total: number;
  notes?: string;
}

const fmt = (n: number) => `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function buildBillHtml(b: BillData): string {
  const partyLabel = b.bill_type === "supplier" ? "Supplier" : "Customer";
  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>${b.doc_type} ${b.number}</title>
<style>
  @page { size: A4; margin: 14mm; }
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{margin:0;padding:0;background:#fff;}
  body{font-family:'Helvetica Neue', Arial, sans-serif;color:#0f1f1a;font-size:11.5px;line-height:1.5;}
  .sheet{width:182mm;margin:0 auto;padding:0;background:#fff;}

  /* Header bar */
  .topbar{height:8px;background:linear-gradient(90deg,#0a3a2a 0%,#1a5a3e 50%,#c4983e 100%);}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding:22px 0 18px 0;border-bottom:1px solid #e8e4d7;}
  .brand-block{display:flex;flex-direction:column;}
  .brand-mono{font-family:Georgia, serif;font-size:11px;letter-spacing:5px;color:#8a6914;text-transform:uppercase;font-weight:600;margin-bottom:4px;}
  .brand{font-family:Georgia, serif;font-size:28px;font-weight:500;color:#0a3a2a;line-height:1;letter-spacing:-0.5px;}
  .brand-sub{font-size:9.5px;letter-spacing:3px;color:#8a6914;text-transform:uppercase;margin-top:6px;}
  .meta{font-size:9.5px;color:#5a6566;margin-top:10px;line-height:1.7;}

  .info{text-align:right;}
  .doc-label{font-family:Georgia, serif;font-size:24px;color:#0a3a2a;letter-spacing:6px;font-weight:500;margin-bottom:8px;}
  .doc-num{font-size:11px;color:#0a3a2a;font-weight:600;letter-spacing:1px;}
  .doc-meta{font-size:9.5px;color:#5a6566;margin-top:4px;line-height:1.6;}
  .status-pill{display:inline-block;margin-top:6px;padding:3px 10px;font-size:8.5px;letter-spacing:2px;text-transform:uppercase;background:#0a3a2a;color:#fff;border-radius:2px;}

  /* Party block */
  .grid-2{display:flex;gap:24px;margin:22px 0 18px 0;}
  .party-card{flex:1;padding:14px 16px;background:#fbf8f0;border-left:3px solid #c4983e;}
  .party-label{font-size:8.5px;text-transform:uppercase;letter-spacing:3px;color:#8a6914;margin-bottom:6px;font-weight:600;}
  .party-name{font-size:14px;color:#0a3a2a;font-weight:600;margin-bottom:2px;}
  .party-line{font-size:10.5px;color:#5a6566;margin-top:1px;}

  /* Items table */
  table{width:100%;border-collapse:collapse;margin-bottom:14px;table-layout:fixed;}
  thead tr{background:#0a3a2a;}
  th{color:#fff;padding:10px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:2px;font-weight:600;}
  td{padding:11px 8px;border-bottom:1px solid #ece9de;font-size:10.5px;vertical-align:top;word-wrap:break-word;color:#1a2a26;}
  tbody tr:nth-child(even) td{background:#fdfbf5;}
  .col-num{width:7%;}.col-item{width:25%;}.col-desc{width:32%;}.col-qty{width:7%;text-align:right;}.col-rate{width:14%;text-align:right;}.col-amt{width:15%;text-align:right;font-weight:600;}
  .item-name{font-weight:600;color:#0a3a2a;}

  /* Totals */
  .totals-wrap{display:flex;justify-content:flex-end;margin-top:6px;}
  .totals{width:55%;background:#fbf8f0;padding:14px 18px;border-top:1px solid #c4983e;}
  .row{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:#5a6566;}
  .row.total{font-family:Georgia, serif;font-weight:600;font-size:18px;color:#0a3a2a;border-top:1.5px solid #c4983e;padding-top:10px;margin-top:8px;}
  .row.total span:last-child{color:#0a3a2a;}
  .gst-note{font-size:8.5px;color:#8a6914;text-align:right;margin-top:4px;letter-spacing:1px;text-transform:uppercase;}

  /* Notes & footer */
  .notes{margin-top:18px;padding:12px 14px;background:#fbf8f0;border-left:3px solid #c4983e;font-size:10.5px;color:#5a6566;line-height:1.6;}
  .notes strong{color:#0a3a2a;display:block;margin-bottom:4px;font-size:9px;letter-spacing:2px;text-transform:uppercase;}
  .footer{margin-top:24px;text-align:center;font-size:8.5px;color:#8a8a8a;border-top:1px solid #e8e4d7;padding-top:12px;letter-spacing:1px;}
  .footer .thanks{font-family:Georgia,serif;font-size:13px;color:#0a3a2a;font-style:italic;margin-bottom:6px;letter-spacing:0;}
  @media print { body{margin:0;} .topbar{print-color-adjust:exact;-webkit-print-color-adjust:exact;} thead tr,.party-card,.totals,.notes{print-color-adjust:exact;-webkit-print-color-adjust:exact;} }
</style></head><body>
<div class="sheet">
  <div class="topbar"></div>
  <div class="header">
    <div class="brand-block">
      <div class="brand-mono">Est. 1985</div>
      <div class="brand">${BRAND.name}</div>
      <div class="brand-sub">Heirloom Sarees · Mysore</div>
      <div class="meta">${BRAND.address}<br/>${BRAND.phoneFormatted} &nbsp;·&nbsp; ${BRAND.email}</div>
    </div>
    <div class="info">
      <div class="doc-label">${b.doc_type}</div>
      <div class="doc-num">${b.number}</div>
      <div class="doc-meta">Date · ${new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
      <div class="doc-meta">Bill type · ${partyLabel}</div>
      ${b.status ? `<div class="status-pill">${b.status}</div>` : ""}
    </div>
  </div>

  <div class="grid-2">
    <div class="party-card">
      <div class="party-label">${b.doc_type === "INVOICE" ? "Billed to" : "Quoted for"}</div>
      <div class="party-name">${b.party_name || "—"}</div>
      ${b.party_email ? `<div class="party-line">${b.party_email}</div>` : ""}
      ${b.party_gst_no ? `<div class="party-line">GSTIN · ${b.party_gst_no}</div>` : ""}
    </div>
    <div class="party-card">
      <div class="party-label">From</div>
      <div class="party-name">${BRAND.name}</div>
      <div class="party-line">${BRAND.email}</div>
      <div class="party-line">${BRAND.phoneFormatted}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th class="col-num">#</th>
      <th class="col-item">Item</th>
      <th class="col-desc">Description</th>
      <th class="col-qty">Qty</th>
      <th class="col-rate">Rate</th>
      <th class="col-amt">Amount</th>
    </tr></thead>
    <tbody>
      ${b.items.map((it, i) => `<tr>
        <td class="col-num">${String(i + 1).padStart(2, "0")}</td>
        <td class="col-item"><span class="item-name">${it.name || "-"}</span></td>
        <td class="col-desc">${it.description || ""}</td>
        <td class="col-qty">${it.quantity}</td>
        <td class="col-rate">${fmt(it.rate)}</td>
        <td class="col-amt">${fmt(it.amount)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="totals">
      <div class="row"><span>Subtotal (excl. GST)</span><span>${fmt(b.subtotal)}</span></div>
      ${b.cgst_percent ? `<div class="row"><span>CGST (${b.cgst_percent}%)</span><span>${fmt(b.cgst_amount)}</span></div>` : ""}
      ${b.sgst_percent ? `<div class="row"><span>SGST (${b.sgst_percent}%)</span><span>${fmt(b.sgst_amount)}</span></div>` : ""}
      ${b.igst_percent ? `<div class="row"><span>IGST (${b.igst_percent}%)</span><span>${fmt(b.igst_amount)}</span></div>` : ""}
      <div class="row total"><span>Total</span><span>${fmt(b.total)}</span></div>
      <div class="gst-note">GST inclusive · all-in price</div>
    </div>
  </div>

  ${b.notes ? `<div class="notes"><strong>Notes</strong>${b.notes}</div>` : ""}

  <div class="footer">
    <div class="thanks">Thank you for choosing ${BRAND.name}.</div>
    Payment due within 15 days · This is a computer-generated document and does not require signature.
  </div>
</div>
</body></html>`;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 12;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
const PX_PER_MM = 3.7795;
const RENDER_SCALE = 2;

async function renderBillToPdf(pdf: jsPDF, b: BillData, addPageBefore: boolean) {
  const widthPx = Math.round(CONTENT_WIDTH_MM * PX_PER_MM);
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-100000px";
  wrapper.style.top = "0";
  wrapper.style.width = widthPx + "px";
  wrapper.style.background = "#ffffff";
  wrapper.innerHTML = buildBillHtml(b);
  document.body.appendChild(wrapper);

  const sheet = wrapper.querySelector(".sheet") as HTMLElement | null;
  if (sheet) { sheet.style.width = widthPx + "px"; sheet.style.margin = "0"; }
  const target = wrapper.querySelector("body") as HTMLElement || wrapper;

  try {
    const canvas = await html2canvas(target, {
      scale: RENDER_SCALE,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: widthPx,
    });

    const imgWidthMm = CONTENT_WIDTH_MM;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
    const pageContentHeightMm = A4_HEIGHT_MM - MARGIN_MM * 2;

    if (addPageBefore) pdf.addPage();

    if (imgHeightMm <= pageContentHeightMm) {
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", MARGIN_MM, MARGIN_MM, imgWidthMm, imgHeightMm, undefined, "FAST");
      return;
    }

    const pxPerMm = canvas.width / imgWidthMm;
    const pagePxHeight = Math.floor(pageContentHeightMm * pxPerMm);
    let renderedPx = 0;
    let pageIndex = 0;
    while (renderedPx < canvas.height) {
      const sliceHeight = Math.min(pagePxHeight, canvas.height - renderedPx);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      if (pageIndex > 0) pdf.addPage();
      const sliceHeightMm = (sliceHeight * imgWidthMm) / canvas.width;
      pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", MARGIN_MM, MARGIN_MM, imgWidthMm, sliceHeightMm, undefined, "FAST");
      renderedPx += sliceHeight;
      pageIndex += 1;
    }
  } finally {
    document.body.removeChild(wrapper);
  }
}

export function printBill(b: BillData) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(buildBillHtml(b));
  win.document.close();
  setTimeout(() => win.print(), 400);
}

export async function downloadBillPdf(b: BillData) {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  await renderBillToPdf(pdf, b, false);
  pdf.save(`${b.doc_type}-${b.number}.pdf`);
}

export async function downloadMergedPdf(bills: BillData[], filename = "bills.pdf") {
  if (!bills.length) return;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  for (let i = 0; i < bills.length; i++) {
    await renderBillToPdf(pdf, bills[i], i > 0);
  }
  pdf.save(filename);
}

export function printBills(bills: BillData[]) {
  if (!bills.length) return;
  const win = window.open("", "_blank");
  if (!win) return;
  const firstHtml = buildBillHtml(bills[0]);
  const styleMatch = firstHtml.match(/<style>[\s\S]*?<\/style>/);
  const styleBlock = styleMatch ? styleMatch[0] : "";
  const stripWrappers = (html: string) =>
    html.replace(/^[\s\S]*<body[^>]*>/, "").replace(/<\/body>[\s\S]*$/, "");
  const body = bills
    .map((b, i) => `<div${i < bills.length - 1 ? ' style="page-break-after:always"' : ""}>${stripWrappers(buildBillHtml(b))}</div>`)
    .join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Bulk Print</title>${styleBlock}</head><body>${body}</body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 600);
}
