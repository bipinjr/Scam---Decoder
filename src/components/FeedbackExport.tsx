"use client";

import { useState } from "react";

type Row = {
  created_at: string; name: string; stream: string; class: string; section: string; phone: string;
  ease: number; clarity: number; favourite: string; recommend: string; confidence: number; doubts: string | null;
};

const FAV: Record<string, string> = {
  message: "Message check", voice: "Call / voice check", screenshot: "Screenshot check",
  radar: "Scam Radar", practice: "Practice mode", languages: "Indian languages",
};
const REC: Record<string, string> = { yes: "Yes", maybe: "Maybe", no: "No" };
const TITLE = "Feedback on Scam Decoder · Tech Anveshanam Tech Expo Event";
const MARK = "SCAM DECODER · TECH ANVESHANAM · CONFIDENTIAL";
const HEAD = ["#", "Submitted (IST)", "Name", "Stream", "Class", "Section", "Phone", "Ease (1-5)", "Clarity (1-5)", "Favourite feature", "Recommend", "Confidence (1-5)", "Doubts / suggestions"];

const ist = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
const stamp = () => new Date().toISOString().slice(0, 10);
const cells = (r: Row, i: number) => [i + 1, ist(r.created_at), r.name, r.stream, r.class, r.section, r.phone, r.ease, r.clarity, FAV[r.favourite] ?? r.favourite, REC[r.recommend] ?? r.recommend, r.confidence, r.doubts ?? ""];
const plural = (n: number) => `${n} response${n === 1 ? "" : "s"}`;
const avg = (rows: Row[], k: "ease" | "clarity" | "confidence") => (rows.reduce((s, r) => s + r[k], 0) / rows.length).toFixed(2);

function save(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Tiled diagonal text, used as the Excel sheet background (Excel's closest thing to a watermark).
function watermarkPng() {
  const c = document.createElement("canvas"); c.width = 900; c.height = 520;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, c.width, c.height);
  g.translate(c.width / 2, c.height / 2); g.rotate(-Math.PI / 7);
  g.fillStyle = "rgba(255, 75, 62, 0.10)"; g.font = "bold 40px Arial"; g.textAlign = "center";
  g.fillText("SCAM DECODER", 0, -30); g.fillText("TECH ANVESHANAM · CONFIDENTIAL", 0, 30);
  return c.toDataURL("image/png").split(",")[1];
}

async function toExcel(rows: Row[]) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Scam Decoder · Team BRAINSTORM"; wb.created = new Date();
  const bg = wb.addImage({ base64: watermarkPng(), extension: "png" });

  const ws = wb.addWorksheet("Responses", { views: [{ state: "frozen", ySplit: 3 }], pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
  ws.addBackgroundImage(bg);
  ws.headerFooter.oddHeader = `&C&"Arial,Bold"&10${MARK}`;
  ws.headerFooter.oddFooter = `&L&8${TITLE}&R&8Page &P of &N`;
  ws.mergeCells(1, 1, 1, HEAD.length);
  Object.assign(ws.getCell("A1"), { value: TITLE });
  ws.getCell("A1").font = { bold: true, size: 15, color: { argb: "FFB8211A" } };
  ws.mergeCells(2, 1, 2, HEAD.length);
  ws.getCell("A2").value = `${plural(rows.length)} · exported ${ist(new Date().toISOString())} · ${MARK}`;
  ws.getCell("A2").font = { italic: true, size: 9, color: { argb: "FF6B7280" } };
  const head = ws.addRow(HEAD);
  head.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD93226" } };
    c.alignment = { vertical: "middle", wrapText: true };
  });
  head.height = 30;
  rows.forEach((r, i) => {
    const row = ws.addRow(cells(r, i));
    row.alignment = { vertical: "top", wrapText: true };
    if (i % 2) row.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0FFF4B3E" } }; });
  });
  [5, 20, 22, 14, 12, 9, 14, 10, 11, 20, 11, 13, 48].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: HEAD.length } };

  const sum = wb.addWorksheet("Summary");
  sum.addBackgroundImage(bg);
  sum.headerFooter.oddHeader = `&C&"Arial,Bold"&10${MARK}`;
  sum.addRow([TITLE]).font = { bold: true, size: 14, color: { argb: "FFB8211A" } };
  sum.addRow([]);
  const stats: (string | number)[][] = [
    ["Total responses", rows.length],
    ["Average ease (1-5)", rows.length ? Number(avg(rows, "ease")) : 0],
    ["Average clarity (1-5)", rows.length ? Number(avg(rows, "clarity")) : 0],
    ["Average confidence (1-5)", rows.length ? Number(avg(rows, "confidence")) : 0],
    [],
    ["Would recommend", "Responses"],
    ...Object.entries(REC).map(([k, v]) => [v, rows.filter((r) => r.recommend === k).length]),
    [],
    ["Favourite feature", "Responses"],
    ...Object.entries(FAV).map(([k, v]) => [v, rows.filter((r) => r.favourite === k).length]),
  ];
  stats.forEach((s) => { const row = sum.addRow(s); if (s[1] === "Responses") row.font = { bold: true }; });
  sum.getColumn(1).width = 30; sum.getColumn(2).width = 14;

  save(new Blob([await wb.xlsx.writeBuffer()]), `ScamDecoder-Feedback-${stamp()}.xlsx`);
}

async function toPdf(rows: Row[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(184, 33, 26);
  doc.text("Feedback on Scam Decoder", 40, 46);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(90, 98, 115);
  doc.text(`Tech Anveshanam Tech Expo Event  ·  ${plural(rows.length)}  ·  exported ${ist(new Date().toISOString())}`, 40, 64);
  if (rows.length)
    doc.text(`Average ease ${avg(rows, "ease")}/5  ·  clarity ${avg(rows, "clarity")}/5  ·  confidence ${avg(rows, "confidence")}/5  ·  would recommend: ${rows.filter((r) => r.recommend === "yes").length} of ${rows.length}`, 40, 79);

  autoTable(doc, {
    startY: 92,
    head: [HEAD],
    body: rows.map(cells),
    styles: { fontSize: 7.5, cellPadding: 4, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [217, 50, 38], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [255, 244, 243] },
    columnStyles: { 0: { cellWidth: 20 }, 12: { cellWidth: 170 } },
    margin: { top: 40, left: 30, right: 30, bottom: 40 },
    didDrawPage: () => {
      const d = doc as unknown as { GState: new (o: { opacity: number }) => unknown; setGState: (g: unknown) => void };
      d.setGState(new d.GState({ opacity: 0.09 }));
      doc.setFont("helvetica", "bold"); doc.setFontSize(46); doc.setTextColor(255, 75, 62);
      doc.text("SCAM DECODER", W / 2, H / 2 - 10, { align: "center", angle: 28 });
      doc.setFontSize(22);
      doc.text("TECH ANVESHANAM · CONFIDENTIAL", W / 2 + 20, H / 2 + 34, { align: "center", angle: 28 });
      d.setGState(new d.GState({ opacity: 1 }));
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(140, 146, 160);
      doc.text(MARK, 30, H - 18);
      doc.text(`Page ${doc.getNumberOfPages()}`, W - 30, H - 18, { align: "right" });
    },
  });
  save(doc.output("blob"), `ScamDecoder-Feedback-${stamp()}.pdf`);
}

export function FeedbackExport() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"" | "xlsx" | "pdf">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(kind: "xlsx" | "pdf") {
    setBusy(kind); setMsg(null);
    try {
      const r = await fetch("/api/feedback/export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode: code }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Couldn't load responses.");
      await (kind === "xlsx" ? toExcel(j.rows) : toPdf(j.rows));
      setMsg({ ok: true, text: `Downloaded ${plural(j.rows.length)} as ${kind === "xlsx" ? "Excel" : "PDF"}.` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally { setBusy(""); }
  }

  return (
    <details className="fb-export group mx-auto mt-8 max-w-3xl rounded-2xl border hairline bg-white/[0.02]">
      <summary className="flex list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-ink-soft transition-colors hover:text-white">
        <span className="flex items-center gap-2">🔐 Organisers: download responses (Excel / PDF)</span>
        <span className="transition-transform duration-300 group-open:rotate-180" aria-hidden>⌄</span>
      </summary>
      <form className="grid gap-3 px-5 pb-5 sm:grid-cols-[1fr_auto_auto]" onSubmit={(e) => { e.preventDefault(); run("xlsx"); }}>
        <label className="sr-only" htmlFor="fb-pass">Organiser passcode</label>
        <input id="fb-pass" type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Organiser passcode"
          className="rounded-xl border border-white/12 bg-raised px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:border-red/60 focus:outline-none" />
        <button type="submit" disabled={!code || !!busy} className="btn-primary rounded-xl px-5 py-3 disabled:opacity-50">{busy === "xlsx" ? "Preparing…" : "⬇ Excel (.xlsx)"}</button>
        <button type="button" onClick={() => run("pdf")} disabled={!code || !!busy} className="btn-ghost rounded-xl px-5 py-3 disabled:opacity-50">{busy === "pdf" ? "Preparing…" : "⬇ PDF"}</button>
        {msg && <p role="status" className={`pop text-sm font-semibold sm:col-span-3 ${msg.ok ? "text-green" : "text-[#ff8a80]"}`}>{msg.text}</p>}
        <p className="text-xs text-ink-soft sm:col-span-3">Files are watermarked “Scam Decoder · Tech Anveshanam · Confidential”. They contain phone numbers: keep them private.</p>
      </form>
    </details>
  );
}
