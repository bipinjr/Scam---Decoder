export const runtime = "nodejs";

const FAVOURITES = ["message", "voice", "screenshot", "radar", "practice", "languages"];
const RECOMMEND = ["yes", "maybe", "no"];

const text = (v: unknown, min: number, max: number) =>
  typeof v === "string" && v.trim().length >= min && v.trim().length <= max ? v.trim() : null;
const rating = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? (v as number) : null);

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return Response.json({ error: "Something went wrong. Try again." }, { status: 400 });

  const phone = typeof b.phone === "string" ? b.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "") : "";
  const row = {
    name: text(b.name, 2, 80),
    stream: text(b.stream, 1, 60),
    class: text(b.class, 1, 30),
    section: text(b.section, 1, 10),
    phone: /^[6-9]\d{9}$/.test(phone) ? phone : null,
    ease: rating(b.ease),
    clarity: rating(b.clarity),
    favourite: FAVOURITES.includes(b.favourite) ? b.favourite : null,
    recommend: RECOMMEND.includes(b.recommend) ? b.recommend : null,
    confidence: rating(b.confidence),
  };
  const missing = Object.entries(row).filter(([, v]) => v === null).map(([k]) => k);
  if (missing.length) return Response.json({ error: "Please complete every question.", missing }, { status: 400 });
  const doubts = typeof b.doubts === "string" && b.doubts.trim() ? b.doubts.trim().slice(0, 1000) : null;

  const key = process.env.SUPABASE_KEY!;
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/feedback`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ ...row, doubts }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[feedback]", (e as Error).message);
    return Response.json({ error: "Couldn't send your feedback. Try again." }, { status: 502 });
  }
}
