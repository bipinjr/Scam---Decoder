export const runtime = "nodejs";

// Organiser export. The passcode is checked inside the database (feedback_export), never here.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const passcode = typeof b?.passcode === "string" ? b.passcode.trim().slice(0, 200) : "";
  if (!passcode) return Response.json({ error: "Enter the organiser passcode." }, { status: 400 });

  const key = process.env.SUPABASE_KEY!;
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/feedback_export`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ passcode }),
    cache: "no-store",
  });
  if (res.status === 403 || res.status === 401) return Response.json({ error: "Wrong passcode." }, { status: 403 });
  if (!res.ok) {
    const body = await res.text();
    if (body.includes("42501") || body.includes("Wrong passcode")) return Response.json({ error: "Wrong passcode." }, { status: 403 });
    console.error("[feedback/export]", res.status, body.slice(0, 200));
    return Response.json({ error: "Couldn't load responses. Try again." }, { status: 502 });
  }
  return Response.json({ rows: await res.json() }, { headers: { "cache-control": "no-store" } });
}
