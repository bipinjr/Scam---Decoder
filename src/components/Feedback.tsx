"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Confetti, DecodeText } from "./fx";
import { FeedbackExport } from "./FeedbackExport";

type Form = {
  name: string; stream: string; class: string; section: string; phone: string;
  ease: number; clarity: number; favourite: string; recommend: string; confidence: number; doubts: string;
};
const EMPTY: Form = { name: "", stream: "", class: "", section: "", phone: "", ease: 0, clarity: 0, favourite: "", recommend: "", confidence: 0, doubts: "" };

const STEPS = ["About you", "Your experience", "Any doubts?"];
const EASE = [["😵", "She'd give up"], ["😟", "Needs a lot of help"], ["😐", "Needs a little help"], ["🙂", "She'd manage"], ["🤩", "She'd teach others"]];
const CLARITY = ["No idea", "Kind of", "Roughly", "Yes, clearly", "Like a pro"];
const FAVOURITES = [
  ["message", "💬", "Message check"], ["voice", "📞", "Call / voice check"], ["screenshot", "🖼️", "Screenshot check"],
  ["radar", "📡", "Scam Radar"], ["practice", "🎯", "Practice mode"], ["languages", "🌐", "Indian languages"],
];
const RECOMMEND = [["yes", "📲", "Sending it today"], ["maybe", "🤔", "Maybe later"], ["no", "🙅", "Nah"]];
const CONFIDENCE = ["Panic and share it", "Call the number", "Ask someone first", "Just ignore it", "Spot it and report it"];
const SUGGESTIONS = [
  "How does it know a link is fake?", "Does it save my messages?", "Will there be an Android app?",
  "Can it check WhatsApp voice notes?", "What if the AI gets it wrong?", "Add more Indian languages",
  "Make a browser extension", "Can my parents use it easily?", "How do I report to cyber police?",
  "Does it work without internet?", "Loved the red-pen markup!", "Add a scam quiz for students",
];

const phoneOk = (p: string) => /^[6-9]\d{9}$/.test(p.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""));

function stepErrors(f: Form, step: number) {
  const e: string[] = [];
  if (step === 0) {
    if (f.name.trim().length < 2) e.push("name");
    if (!f.stream.trim()) e.push("stream");
    if (!f.class.trim()) e.push("class");
    if (!f.section.trim()) e.push("section");
    if (!phoneOk(f.phone)) e.push("phone");
  }
  if (step === 1) (["ease", "clarity", "favourite", "recommend", "confidence"] as const).forEach((k) => !f[k] && e.push(k));
  return e;
}

export function Feedback() {
  const [f, setF] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [shake, setShake] = useState(0);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => e.filter((x) => x !== k)); };

  function go(to: number) {
    if (to > step) {
      const e = stepErrors(f, step);
      if (e.length) { setErrors(e); setShake((s) => s + 1); return; }
    }
    setErrors([]); setDir(to > step ? 1 : -1); setStep(to);
    document.getElementById("feedback-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    setState("sending");
    try {
      const r = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  }

  const err = (k: string) => errors.includes(k);

  return (
    <section id="feedback" className="relative isolate overflow-hidden pb-28 pt-6">
      <div className="fb-ribbon ticker relative -rotate-1 border-y border-red/40 bg-red py-3 text-night" aria-hidden>
        <div className="ticker-track fb-ribbon-track whitespace-nowrap text-lg font-extrabold uppercase tracking-[0.2em]">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-10 pr-10">
              {["Your feedback matters", "Tech Anveshanam 2026", "Tell us what you think", "Team BRAINSTORM", "Help us stop scams", "60 seconds, 5 questions"].map((t) => <span key={t}>✦ {t}</span>)}
            </span>
          ))}
        </div>
      </div>
      <div className="mesh opacity-70" aria-hidden />
      <div className="grid-bg" aria-hidden />
      <p className="fb-giant pointer-events-none absolute inset-x-0 top-24 select-none text-center font-black leading-none tracking-tighter" aria-hidden>FEEDBACK</p>
      {["💬", "⭐", "👍", "🛡️", "💡", "✅", "📣", "❤️"].map((e, i) => (
        <span key={e} className="fb-float pointer-events-none absolute select-none text-3xl sm:text-4xl" aria-hidden
          style={{ left: `${[6, 88, 14, 80, 4, 92, 20, 72][i]}%`, top: `${[18, 22, 48, 52, 78, 80, 92, 90][i]}%`, "--i": i } as CSSProperties}>{e}</span>
      ))}
      <div className="relative mx-auto mt-24 max-w-3xl px-4 sm:px-6">
        <div className="reveal text-center">
          <p className="fb-eyebrow mx-auto inline-flex items-center gap-2 rounded-full border border-red/40 bg-red/10 px-4 py-1.5 text-sm font-semibold text-[#ffb4ad]">
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
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">Tried Scam Decoder? Tell us how it went. It takes about a minute.</p>
        </div>

        <div id="feedback-card" className="card aurora fb-card reveal relative mt-12 scroll-mt-24 p-6 sm:p-10">
          {state === "done" ? (
            <Thanks name={f.name} onAgain={() => { setF(EMPTY); setStep(0); setState("idle"); }} />
          ) : (
            <>
              <Progress step={step} onJump={(i) => i < step && go(i)} />

              <div key={step} className={dir > 0 ? "fb-step-next" : "fb-step-prev"}>
                {step === 0 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name" error={err("name") && "Please enter your name."} className="sm:col-span-2" i={0}>
                      <input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={80} autoComplete="name" placeholder="e.g. Ananya Rao" />
                    </Field>
                    <Field label="Stream" error={err("stream") && "Please enter your stream."} i={1}>
                      <input value={f.stream} onChange={(e) => set("stream", e.target.value)} maxLength={60} list="fb-streams" placeholder="e.g. BCA" />
                      <datalist id="fb-streams">{["BCA", "BCom", "BSc", "BBA", "BA", "BE / BTech", "MCA", "MBA", "PUC", "Diploma"].map((s) => <option key={s} value={s} />)}</datalist>
                    </Field>
                    <Field label="Class / Year" error={err("class") && "Please enter your class."} i={2}>
                      <input value={f.class} onChange={(e) => set("class", e.target.value)} maxLength={30} list="fb-classes" placeholder="e.g. 2nd Year" />
                      <datalist id="fb-classes">{["1st Year", "2nd Year", "3rd Year", "4th Year", "1st PUC", "2nd PUC", "Faculty", "Visitor"].map((s) => <option key={s} value={s} />)}</datalist>
                    </Field>
                    <Field label="Section" error={err("section") && "Please enter your section."} i={3}>
                      <input value={f.section} onChange={(e) => set("section", e.target.value.toUpperCase())} maxLength={10} list="fb-sections" placeholder="e.g. A" />
                      <datalist id="fb-sections">{["A", "B", "C", "D", "E", "F"].map((s) => <option key={s} value={s} />)}</datalist>
                    </Field>
                    <Field label="Phone number" error={err("phone") && "Enter a valid 10-digit mobile number."} i={4}>
                      <input value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/[^\d+ ]/g, ""))} maxLength={16} type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" />
                    </Field>
                    <p className="text-sm text-ink-soft sm:col-span-2">🔒 Your details are used only for this event&apos;s feedback and are never shown publicly.</p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <Question n={1} title="If your grandma tried Scam Decoder on her own, how would it go?" error={err("ease")}>
                      <div className="grid grid-cols-5 gap-2">
                        {EASE.map(([emoji, label], i) => (
                          <Option key={label} name="ease" checked={f.ease === i + 1} onChange={() => set("ease", i + 1)} className="fb-emoji flex-col py-3">
                            <span className="text-3xl sm:text-4xl" aria-hidden>{emoji}</span>
                            <span className="mt-1 text-[0.7rem] leading-tight sm:text-xs">{label}</span>
                          </Option>
                        ))}
                      </div>
                    </Question>

                    <Question n={2} title="Could you now explain to a friend WHY that message was a scam?" error={err("clarity")}>
                      <div className="grid grid-cols-5 gap-2">
                        {CLARITY.map((label, i) => (
                          <Option key={label} name="clarity" checked={f.clarity === i + 1} onChange={() => set("clarity", i + 1)} className="flex-col py-3">
                            <span className="font-pen text-3xl font-bold leading-none">{i + 1}</span>
                            <span className="mt-1 text-[0.7rem] leading-tight sm:text-xs">{label}</span>
                          </Option>
                        ))}
                      </div>
                    </Question>

                    <Question n={3} title="Which feature would you show your family first?" error={err("favourite")}>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {FAVOURITES.map(([id, icon, label]) => (
                          <Option key={id} name="favourite" checked={f.favourite === id} onChange={() => set("favourite", id)} className="justify-start gap-2 px-3 py-3 text-left">
                            <span className="fb-icon text-xl" aria-hidden>{icon}</span><span className="text-sm font-semibold">{label}</span>
                          </Option>
                        ))}
                      </div>
                    </Question>

                    <Question n={4} title="Would you drop Scam Decoder in your family WhatsApp group?" error={err("recommend")}>
                      <div className="grid grid-cols-3 gap-2">
                        {RECOMMEND.map(([id, icon, label]) => (
                          <Option key={id} name="recommend" checked={f.recommend === id} onChange={() => set("recommend", id)} className="fb-emoji flex-col py-4">
                            <span className="text-3xl" aria-hidden>{icon}</span><span className="mt-1 text-xs font-semibold sm:text-sm">{label}</span>
                          </Option>
                        ))}
                      </div>
                    </Question>

                    <Question n={5} title="Tomorrow you get: “Your bank account will be blocked today. Share the OTP to stop it.” What do you do?" error={err("confidence")}>
                      <div className="flex h-44 items-end gap-2" role="presentation">
                        {CONFIDENCE.map((label, i) => (
                          <Option key={label} name="confidence" checked={f.confidence === i + 1} onChange={() => set("confidence", i + 1)}
                            className={`fb-meter flex-1 flex-col justify-end pb-2 ${f.confidence === i + 1 ? "fb-meter-on" : ""}`} style={{ height: `${36 + i * 16}%`, "--i": i } as CSSProperties}>
                            <span className="text-[0.65rem] font-semibold leading-tight sm:text-xs">{label}</span>
                          </Option>
                        ))}
                      </div>
                    </Question>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <Field label="Any doubts, questions or suggestions? (optional)" i={0}>
                      <textarea value={f.doubts} onChange={(e) => set("doubts", e.target.value)} maxLength={1000} rows={5} placeholder="Ask us anything about Scam Decoder, or tell us what to improve…" />
                    </Field>
                    <p className="-mt-4 text-right text-xs text-ink-soft tabular-nums">{f.doubts.length} / 1000</p>
                    <div>
                      <p className="text-sm font-semibold text-white">💡 Tap to add, no typing needed</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {SUGGESTIONS.map((sg, i) => {
                          const used = f.doubts.includes(sg);
                          return (
                            <button key={sg} type="button" aria-pressed={used}
                              onClick={() => set("doubts", used ? f.doubts.replace(sg, "").replace(/\n{2,}/g, "\n").trim() : (f.doubts.trim() ? f.doubts.trim() + "\n" : "") + sg)}
                              className={`fb-sugg rounded-full border px-3.5 py-2 text-sm ${used ? "fb-sugg-on" : ""}`} style={{ "--i": i } as CSSProperties}>
                              {used ? "✓ " : "+ "}{sg}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="fb-summary rounded-2xl border hairline bg-white/[0.03] p-5">
                      <p className="text-sm font-semibold text-white">Quick review</p>
                      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                        {[
                          f.name, `${f.stream} · ${f.class} · ${f.section}`,
                          `Grandma test ${EASE[f.ease - 1]?.[0] ?? ""}`, `Can explain: ${CLARITY[f.clarity - 1] ?? ""}`,
                          `Show first: ${FAVOURITES.find((x) => x[0] === f.favourite)?.[2] ?? ""}`,
                          `Family group: ${RECOMMEND.find((x) => x[0] === f.recommend)?.[2] ?? ""}`,
                          `You would: ${CONFIDENCE[f.confidence - 1] ?? ""}`,
                        ].map((s, i) => <li key={i} className="fb-tag rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-ink" style={{ "--i": i } as CSSProperties}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div aria-live="polite" className="min-h-6">
                {errors.length > 0 && <p key={shake} className="shake mt-5 text-sm font-semibold text-[#ff8a80]">{step === 0 ? "Please fill in the highlighted details" : "Please answer the highlighted questions"} to continue.</p>}
                {state === "error" && <p className="shake mt-5 text-sm font-semibold text-[#ff8a80]">Couldn&apos;t send your feedback. Check your connection and try again.</p>}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                {step > 0 ? <button type="button" onClick={() => go(step - 1)} className="btn-ghost rounded-xl px-5 py-3">← Back</button> : <span />}
                {step < 2 ? (
                  <button type="button" onClick={() => go(step + 1)} className="btn-primary fb-next rounded-xl px-6 py-3 text-lg">Next →</button>
                ) : (
                  <button type="button" onClick={submit} disabled={state === "sending"} className="btn-primary fb-next rounded-xl px-6 py-3 text-lg disabled:opacity-70">
                    {state === "sending" ? <span className="inline-flex items-center gap-2"><span className="fb-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />Sending…</span> : "Send feedback ✓"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <FeedbackExport />
      </div>
    </section>
  );
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between gap-2">
        {STEPS.map((s, i) => (
          <button key={s} type="button" onClick={() => onJump(i)} disabled={i >= step} aria-current={i === step ? "step" : undefined}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors disabled:cursor-default ${i <= step ? "text-white" : "text-ink-soft"}`}>
            <span className={`fb-dot grid h-7 w-7 place-items-center rounded-full border-2 text-xs ${i < step ? "border-green bg-green text-night" : i === step ? "fb-dot-on border-red text-white" : "border-white/20"}`}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="fb-bar h-full rounded-full bg-gradient-to-r from-red to-[#ff8a5c]" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p className="mt-3 text-xs text-ink-soft sm:hidden">Step {step + 1} of 3 · {STEPS[step]}</p>
    </div>
  );
}

function Field({ label, error, className = "", i, children }: { label: string; error?: string | false; className?: string; i: number; children: ReactNode }) {
  return (
    <label className={`fb-field block ${error ? "fb-invalid" : ""} ${className}`} style={{ "--i": i } as CSSProperties}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <span className="fb-input relative block">{children}<span className="fb-ink" aria-hidden /></span>
      {error && <span className="pop mt-1.5 block text-xs font-semibold text-[#ff8a80]">{error}</span>}
    </label>
  );
}

function Question({ n, title, error, children }: { n: number; title: string; error: boolean; children: ReactNode }) {
  return (
    <fieldset className={`fb-q rounded-2xl border p-4 sm:p-5 ${error ? "fb-invalid border-red/60 bg-red/[0.06]" : "hairline bg-white/[0.02]"}`} style={{ "--i": n - 1 } as CSSProperties}>
      <legend className="sr-only">{title}</legend>
      <p className="mb-4 flex items-start gap-3 font-semibold text-white" aria-hidden>
        <span className="font-pen text-2xl leading-none text-red">Q{n}</span><span>{title}</span>
      </p>
      {children}
      {error && <p className="pop mt-2 text-xs font-semibold text-[#ff8a80]">Please pick an answer.</p>}
    </fieldset>
  );
}

function Option({ name, checked, onChange, className = "", style, children }: { name: string; checked: boolean; onChange: () => void; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <label className={`fb-opt flex items-center justify-center rounded-xl border text-center ${checked ? "fb-opt-on" : ""} ${className}`} style={style}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function Thanks({ name, onAgain }: { name: string; onAgain: () => void }) {
  return (
    <div className="py-10 text-center" role="status">
      <Confetti count={70} />
      <div className="stamp pop mx-auto inline-block px-6 py-3 font-mono text-3xl font-bold text-green sm:text-4xl">THANK YOU</div>
      <h3 className="fb-rise mt-8 text-2xl font-semibold text-white sm:text-3xl" style={{ "--i": 1 } as CSSProperties}>
        Thanks{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}! Your feedback is in.
      </h3>
      <p className="fb-rise mx-auto mt-3 max-w-md text-ink-soft" style={{ "--i": 2 } as CSSProperties}>
        It helps Team BRAINSTORM make Scam Decoder better. Stay alert: never share an OTP, and call <b className="text-white">1930</b> if you lose money to a scam.
      </p>
      <button type="button" onClick={onAgain} className="btn-ghost fb-rise mt-8 rounded-xl px-5 py-3" style={{ "--i": 3 } as CSSProperties}>Submit another response</button>
    </div>
  );
}
