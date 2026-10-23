"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Confetti, DecodeText } from "./fx";
import { FeedbackExport } from "./FeedbackExport";
import { LogoMark } from "./Logo";

type Form = {
  name: string; stream: string; class: string; section: string; phone: string;
  ease: number; clarity: number; favourite: string; recommend: string; confidence: number; doubts: string;
};
const EMPTY: Form = { name: "", stream: "", class: "", section: "", phone: "", ease: 0, clarity: 0, favourite: "", recommend: "", confidence: 0, doubts: "" };

const STREAMS = ["Science (PCMB)", "Science (PCMC)", "Science (PCME)", "Science (PCMS)", "Science (PCM)", "Commerce (CEBA)", "Commerce (CSBA)", "Commerce (SEBA)", "Commerce (HEBA)", "Commerce (BEBA)", "Commerce (MEBA)", "Faculty"];
const CLASSES = ["2nd PUC", "Faculty"];
const EASE = [["😵", "She'd give up"], ["😟", "She'd need a lot of help"], ["😐", "She'd need a little help"], ["🙂", "She'd manage"], ["🤩", "She'd teach others"]];
const CLARITY = [["🤷", "No idea"], ["🤏", "Kind of"], ["👌", "Roughly"], ["💡", "Yes, clearly"], ["🧠", "Like a pro"]];
const FAVOURITES = [
  ["message", "💬", "Message check"], ["voice", "📞", "Call / voice check"], ["screenshot", "🖼️", "Screenshot check"],
  ["radar", "📡", "Scam Radar"], ["practice", "🎯", "Practice mode"], ["languages", "🌐", "Indian languages"],
];
const RECOMMEND = [["yes", "📲", "Sending it today"], ["maybe", "🤔", "Maybe later"], ["no", "🙅", "Nah"]];
const CONFIDENCE = [["😱", "Panic and share it"], ["📞", "Call the number"], ["🙋", "Ask someone first"], ["🙈", "Just ignore it"], ["🛡️", "Spot it and report it"]];
const SUGGESTIONS = [
  "How does it spot fake links?", "Does it save my messages?", "Android app?", "What if the AI is wrong?",
  "More languages please", "Easy for my parents?",
  "Loved the red pen!", "Add a scam quiz",
];

// One screen per step: details, five questions, then doubts + send.
const SCREENS = ["About you", "Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Any doubts?"];
const ANSWER: (keyof Form | null)[] = [null, "ease", "clarity", "favourite", "recommend", "confidence", null];

const isFaculty = (f: Form) => /faculty/i.test(f.class) || /faculty/i.test(f.stream);
const phoneOk = (p: string) => /^[6-9]\d{9}$/.test(p.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""));

function screenErrors(f: Form, s: number) {
  const e: string[] = [];
  if (s === 0) {
    if (f.name.trim().length < 2) e.push("name");
    if (!f.stream.trim()) e.push("stream");
    if (!f.class.trim()) e.push("class");
    if (!f.section.trim() && !isFaculty(f)) e.push("section");
    if (!phoneOk(f.phone)) e.push("phone");
  }
  const k = ANSWER[s];
  if (k && !f[k]) e.push(k);
  return e;
}

export function Feedback() {
  const [f, setF] = useState<Form>(EMPTY);
  const [screen, setScreen] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [shake, setShake] = useState(0);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => e.filter((x) => x !== k)); };
  const last = SCREENS.length - 1;
  const answered = !ANSWER[screen] || !!f[ANSWER[screen]!];

  function go(to: number) {
    if (to > screen) {
      const e = screenErrors(f, screen);
      if (e.length) { setErrors(e); setShake((s) => s + 1); return; }
    }
    setErrors([]); setDir(to > screen ? 1 : -1); setScreen(to);
    document.querySelector(".fb-phone")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function submit() {
    setState("sending");
    try {
      const r = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, section: f.section.trim() || (isFaculty(f) ? "-" : "") }) });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  }

  const err = (k: string) => errors.includes(k);
  const part = state === "done" ? 3 : screen === 0 ? 0 : screen === last ? 2 : 1;

  return (
    <section id="feedback" className="relative isolate overflow-clip pb-28 pt-6">
      <div className="fb-ribbon ticker relative -rotate-1 border-y border-red/40 bg-red py-3 text-night" aria-hidden>
        <div className="ticker-track fb-ribbon-track whitespace-nowrap text-lg font-extrabold uppercase tracking-[0.2em]">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-10 pr-10">
              {["Your feedback matters", "Tech Anveshanam 2026", "Tell us what you think", "Team BRAINSTORM", "Help us stop scams", "60 seconds, 5 questions"].map((t) => <span key={t}>✦ {t}</span>)}
            </span>
          ))}
        </div>
      </div>

      {/* Floating background */}
      <div className="mesh opacity-70" aria-hidden />
      <div className="grid-bg" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <span className="fb-orb fb-orb-a" /><span className="fb-orb fb-orb-b" /><span className="fb-orb fb-orb-c" />
        <span className="fb-ring" style={{ left: "8%", top: "30%" } as CSSProperties} />
        <span className="fb-ring fb-ring-2" style={{ right: "6%", top: "62%" } as CSSProperties} />
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} className="fb-particle" style={{ left: `${(i * 37) % 100}%`, "--d": `${(i % 7) * 1.3}s`, "--t": `${11 + (i % 5) * 3}s`, "--s": `${3 + (i % 4) * 2}px` } as CSSProperties} />
        ))}
      </div>
      <p className="fb-giant pointer-events-none absolute inset-x-0 top-24 select-none text-center font-black leading-none tracking-tighter" aria-hidden>FEEDBACK</p>
      {["💬", "⭐", "👍", "🛡️", "💡", "✅", "📣", "❤️"].map((e, i) => (
        <span key={e} className="fb-float pointer-events-none absolute select-none text-3xl sm:text-4xl" aria-hidden
          style={{ left: `${[4, 90, 12, 84, 3, 93, 22, 70][i]}%`, top: `${[18, 22, 48, 50, 78, 82, 94, 92][i]}%`, "--i": i } as CSSProperties}>{e}</span>
      ))}

      <div className="relative mx-auto mt-20 grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,27rem)] lg:gap-16">
        <div className="reveal text-center lg:text-left">
          <p className="fb-eyebrow inline-flex items-center gap-2 rounded-full border border-red/40 bg-red/10 px-4 py-1.5 text-sm font-semibold text-[#ffb4ad]">
            <span className="relative flex h-2 w-2"><span className="fb-ping absolute inset-0 rounded-full bg-red" /><span className="relative h-2 w-2 rounded-full bg-red" /></span>
            Tech Anveshanam · Tech Expo Event
          </p>
          <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            <DecodeText text="Feedback on " />
            <span className="circled whitespace-nowrap">
              <DecodeText text="Scam Decoder" delay={200} />
              <svg viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden>
                <path pathLength={1} d="M14 34 C 10 12, 52 4, 86 8 S 120 26, 108 44 S 52 60, 24 50 S 4 28, 30 14" />
              </svg>
            </span>
          </h2>
          <p className="mt-4 text-lg text-ink-soft sm:text-xl">
            for <span className="font-pen text-3xl font-bold text-red">Tech Anveshanam Tech Expo Event</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft lg:mx-0">Tried Scam Decoder? Tell us how it went. One tap per screen, about a minute.</p>
          <ol className="mx-auto mt-8 grid max-w-md gap-3 text-left lg:mx-0">
            {[["👤", "About you", "Name, stream, class, section"], ["🎯", "5 quick questions", "One per screen, just tap"], ["💬", "Any doubts?", "Pick a suggestion or write your own"]].map(([icon, t, d], i) => (
              <li key={t} className={`fb-steprow flex items-center gap-4 rounded-2xl border px-4 py-3 ${i === part ? "fb-steprow-on" : "hairline"}`} style={{ "--i": i } as CSSProperties}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-2xl" aria-hidden>{icon}</span>
                <span><b className="block text-lg text-white">{t}</b><span className="text-ink-soft">{d}</span></span>
                {i < part && <span className="pop ml-auto text-xl text-green" aria-label="done">✓</span>}
              </li>
            ))}
          </ol>
          <FeedbackExport />
        </div>

        {/* The phone: fixed height, one screen at a time */}
        <div className="phone-in mx-auto w-full max-w-[27rem]">
          <div className="phone aurora fb-phone">
            <div id="feedback-card" className="phone-screen fb-card relative"
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
              <div className="fb-spot" aria-hidden />
              <div className="phone-notch" aria-hidden />
              <div className="flex items-center gap-3 border-b hairline bg-white/[0.03] px-5 pb-3 pt-2">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08]" aria-hidden><LogoMark size={28} /></span>
                <div className="leading-tight">
                  <p className="text-lg font-semibold text-white">Scam Decoder</p>
                  <p className="text-ink-soft">{state === "done" ? "Feedback sent" : SCREENS[screen]}</p>
                </div>
                <span key={state === "done" ? "done" : screen} className={`pop ml-auto rounded-full px-3 py-1 font-bold ${state === "done" ? "bg-green-wash text-green" : "bg-red-wash text-[#ff8a80]"}`}>
                  {state === "done" ? "Sent ✓" : `${screen + 1} / ${SCREENS.length}`}
                </span>
              </div>

              {/* Story-style progress */}
              <div className="flex gap-1.5 px-5 pt-3" aria-hidden>
                {SCREENS.map((s, i) => (
                  <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.1]">
                    <span className={`fb-seg block h-full rounded-full bg-red ${state === "done" || i < screen ? "fb-seg-full" : i === screen ? "fb-seg-now" : ""}`} />
                  </span>
                ))}
              </div>

              <div className="chat-wall flex h-[33rem] flex-col">
                {state === "done" ? (
                  <Thanks name={f.name} onAgain={() => { setF(EMPTY); setScreen(0); setState("idle"); }} />
                ) : (
                  <>
                    <div key={screen} className={`fb-scroll flex-1 overflow-y-auto px-5 pb-2 pt-4 ${dir > 0 ? "fb-step-next" : "fb-step-prev"}`}>
                      {screen === 0 && (
                        <div className="grid gap-2.5">
                          <Field label="Your name" error={err("name") && "Please enter your name."} i={0}>
                            <input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" placeholder="e.g. Ananya Rao" />
                          </Field>
                          <Field label="Stream" error={err("stream") && "Please pick your stream."} i={1}>
                            <Combo id="fb-stream" value={f.stream} onChange={(v) => set("stream", v)} maxLength={60} options={STREAMS} placeholder="e.g. Science (PCMC)" />
                          </Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Class" error={err("class") && "Pick your class."} i={2}>
                              <Combo id="fb-class" value={f.class} onChange={(v) => set("class", v)} maxLength={30} options={CLASSES} placeholder="2nd PUC" />
                            </Field>
                            <Field label={isFaculty(f) ? "Section (optional)" : "Section"} error={err("section") && "Enter section."} i={3}>
                              <input value={f.section} onChange={(e) => set("section", e.target.value.toUpperCase())} maxLength={10} placeholder="e.g. A" />
                            </Field>
                          </div>
                          <Field label="Phone number" error={err("phone") && "Enter a valid 10-digit mobile number."} i={4}>
                            <input value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/[^\d+ ]/g, ""))} maxLength={16} type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" />
                          </Field>
                          <p className="text-sm text-ink-soft">🔒 Used only for this event&apos;s feedback, never shown publicly.</p>
                        </div>
                      )}

                      {screen === 1 && (
                        <Question n={1} title="If your grandma tried Scam Decoder on her own, how would it go?" error={err("ease")}>
                          {EASE.map(([emoji, label], i) => (
                            <Option key={label} name="ease" checked={f.ease === i + 1} onChange={() => set("ease", i + 1)} i={i}><Row emoji={emoji} label={label} /></Option>
                          ))}
                        </Question>
                      )}

                      {screen === 2 && (
                        <Question n={2} title="Could you now explain to a friend WHY that message was a scam?" error={err("clarity")}>
                          {CLARITY.map(([emoji, label], i) => (
                            <Option key={label} name="clarity" checked={f.clarity === i + 1} onChange={() => set("clarity", i + 1)} i={i}><Row emoji={emoji} label={label} level={i} /></Option>
                          ))}
                        </Question>
                      )}

                      {screen === 3 && (
                        <Question n={3} title="Which feature would you show your family first?" error={err("favourite")} cols={2}>
                          {FAVOURITES.map(([id, icon, label], i) => (
                            <Option key={id} name="favourite" checked={f.favourite === id} onChange={() => set("favourite", id)} i={i}><Row emoji={icon} label={label} compact /></Option>
                          ))}
                        </Question>
                      )}

                      {screen === 4 && (
                        <Question n={4} title="Would you drop Scam Decoder in your family WhatsApp group?" error={err("recommend")}>
                          {RECOMMEND.map(([id, icon, label], i) => (
                            <Option key={id} name="recommend" checked={f.recommend === id} onChange={() => set("recommend", id)} i={i}><Row emoji={icon} label={label} /></Option>
                          ))}
                        </Question>
                      )}

                      {screen === 5 && (
                        <Question n={5} title="An SMS says: “Account blocked today, share OTP.” What do you do?" error={err("confidence")}>
                          {CONFIDENCE.map(([emoji, label], i) => (
                            <Option key={label} name="confidence" checked={f.confidence === i + 1} onChange={() => set("confidence", i + 1)} i={i}><Row emoji={emoji} label={label} level={i} /></Option>
                          ))}
                        </Question>
                      )}

                      {screen === 6 && (
                        <div className="space-y-3">
                          <Field label="Any doubts, questions or suggestions? (optional)" i={0}>
                            <textarea value={f.doubts} onChange={(e) => set("doubts", e.target.value)} maxLength={1000} rows={2} placeholder="Type here, or tap a suggestion below…" />
                          </Field>
                          <div>
                            <p className="text-sm font-semibold text-white">💡 Tap to add, no typing needed</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {SUGGESTIONS.map((sg, i) => {
                                const used = f.doubts.includes(sg);
                                return (
                                  <button key={sg} type="button" aria-pressed={used}
                                    onClick={() => set("doubts", used ? f.doubts.replace(sg, "").replace(/\n{2,}/g, "\n").trim() : (f.doubts.trim() ? f.doubts.trim() + "\n" : "") + sg)}
                                    className={`fb-sugg rounded-full border px-3 py-1.5 text-sm ${used ? "fb-sugg-on" : ""}`} style={{ "--i": i } as CSSProperties}>
                                    {used ? "✓ " : "+ "}{sg}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t hairline bg-[#0a1120]/90 px-5 pb-4 pt-2">
                      <div aria-live="polite" className="min-h-5">
                        {errors.length > 0 && <p key={shake} className="shake mb-2 text-sm font-semibold text-[#ff8a80]">{screen === 0 ? "Fill in the highlighted details to continue." : "Pick an answer to continue."}</p>}
                        {state === "error" && <p className="shake mb-2 text-sm font-semibold text-[#ff8a80]">Couldn&apos;t send. Check your connection and try again.</p>}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        {screen > 0 ? <button type="button" onClick={() => go(screen - 1)} className="btn-ghost rounded-xl px-5 py-3">← Back</button> : <span />}
                        {screen < last ? (
                          <button type="button" onClick={() => go(screen + 1)} className={`btn-primary fb-next rounded-xl px-7 py-3 text-lg ${answered && screen > 0 ? "fb-next-ready" : ""}`}>Next →</button>
                        ) : (
                          <button type="button" onClick={submit} disabled={state === "sending"} className="btn-primary fb-next fb-next-ready rounded-xl px-6 py-3 text-lg disabled:opacity-70">
                            {state === "sending" ? <span className="inline-flex items-center gap-2"><span className="fb-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />Sending…</span> : "Send feedback ✓"}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Themed type-ahead dropdown (native <datalist> popups can't be styled).
function Combo({ id, value, onChange, options, placeholder, maxLength }: { id: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; maxLength: number }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const q = value.trim().toLowerCase();
  const shown = !q || options.some((o) => o.toLowerCase() === q) ? options : options.filter((o) => o.toLowerCase().includes(q));
  const pick = (o: string) => { onChange(o); setOpen(false); };
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % Math.max(shown.length, 1));
    } else if (e.key === "Enter" && open && shown[active]) { e.preventDefault(); pick(shown[active]); }
    else if (e.key === "Escape") setOpen(false);
  }
  return (
    <div className="relative">
      <input ref={input} id={id} value={value} maxLength={maxLength} placeholder={placeholder} autoComplete="off"
        role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => { setOpen(true); setActive(0); }} onBlur={() => setOpen(false)} onKeyDown={onKey} className="pr-11" />
      <button type="button" tabIndex={-1} aria-hidden onMouseDown={(e) => { e.preventDefault(); setOpen(!open); input.current?.focus(); }}
        className={`absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-ink-soft transition-transform duration-300 hover:text-white ${open ? "rotate-180 text-red" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && shown.length > 0 && (
        <ul id={listId} role="listbox" className="fb-menu absolute inset-x-0 top-full z-40 mt-2 max-h-60 overflow-auto rounded-2xl border border-white/10 p-1.5">
          {shown.map((o, i) => (
            <li key={o} id={`${listId}-${i}`} role="option" aria-selected={o === value}
              onMouseDown={(e) => { e.preventDefault(); pick(o); }} onMouseEnter={() => setActive(i)}
              className={`fb-menu-item flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.95rem] ${i === active ? "fb-menu-active" : ""} ${o === value ? "font-semibold text-white" : "text-ink"}`}
              style={{ "--i": i } as CSSProperties}>
              <span>{o.replace(/ \(.*\)$/, "")}{o.includes("(") && <span className="ml-2 rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs text-[#ffb4ad]">{o.match(/\((.*)\)/)?.[1]}</span>}</span>
              {o === value && <span className="text-red" aria-hidden>✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, error, className = "", i, children }: { label: string; error?: string | false; className?: string; i: number; children: ReactNode }) {
  return (
    <label className={`fb-field block ${error ? "fb-invalid" : ""} ${className}`} style={{ "--i": i } as CSSProperties}>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <span className="fb-input relative block">{children}<span className="fb-ink" aria-hidden /></span>
      {error && <span className="pop mt-1.5 block text-xs font-semibold text-[#ff8a80]">{error}</span>}
    </label>
  );
}

function Question({ n, title, error, cols = 1, children }: { n: number; title: string; error: boolean; cols?: number; children: ReactNode }) {
  return (
    <fieldset className={error ? "fb-invalid" : ""}>
      <legend className="sr-only">{title}</legend>
      <p className="fb-qtitle mb-4 text-[1.15rem] font-semibold leading-snug text-white" aria-hidden>
        <span className="fb-qnum mb-1 block font-pen text-3xl leading-none text-red">Q{n}</span>{title}
      </p>
      <div className={`grid gap-1.5 ${cols === 2 ? "grid-cols-2" : ""}`}>{children}</div>
    </fieldset>
  );
}

function Row({ emoji, label, level, compact }: { emoji: string; label: string; level?: number; compact?: boolean }) {
  return (
    <>
      <span className="fb-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-xl" aria-hidden>{emoji}</span>
      <span className={`flex-1 text-left font-semibold leading-snug ${compact ? "text-[0.92rem]" : "text-[1.02rem]"}`}>{label}</span>
      {level !== undefined && (
        <span className="flex shrink-0 gap-1" aria-hidden>
          {Array.from({ length: 5 }, (_, k) => <span key={k} className={`fb-pip h-2 w-2 rounded-full ${k <= level ? "fb-pip-on" : ""}`} style={{ "--k": k } as CSSProperties} />)}
        </span>
      )}
      {!compact && <span className="fb-radio grid h-6 w-6 shrink-0 place-items-center rounded-full border-2" aria-hidden><span className="fb-radio-dot h-2.5 w-2.5 rounded-full" /></span>}
    </>
  );
}

function Option({ name, checked, onChange, i, children }: { name: string; checked: boolean; onChange: () => void; i: number; children: ReactNode }) {
  return (
    <label className={`fb-opt fb-row flex items-center gap-3 rounded-2xl border px-3 py-2 ${checked ? "fb-opt-on" : ""}`} style={{ "--i": i } as CSSProperties}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function Thanks({ name, onAgain }: { name: string; onAgain: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center" role="status">
      <Confetti count={70} />
      <div className="relative inline-block">
        <span className="fb-burst" aria-hidden /><span className="fb-burst" style={{ animationDelay: ".35s" }} aria-hidden />
        <div className="stamp pop relative inline-block px-6 py-3 font-mono text-3xl font-bold text-green">THANK YOU</div>
      </div>
      <h3 className="fb-rise mt-8 text-2xl font-semibold text-white" style={{ "--i": 1 } as CSSProperties}>
        Thanks{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}! Your feedback is in.
      </h3>
      <p className="fb-rise mt-3 text-ink-soft" style={{ "--i": 2 } as CSSProperties}>
        It helps Team BRAINSTORM make Scam Decoder better. Never share an OTP, and call <b className="text-white">1930</b> if you lose money to a scam.
      </p>
      <button type="button" onClick={onAgain} className="btn-ghost fb-rise mt-8 rounded-xl px-5 py-3" style={{ "--i": 3 } as CSSProperties}>Submit another response</button>
    </div>
  );
}
