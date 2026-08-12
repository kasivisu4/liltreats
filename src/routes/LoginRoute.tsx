import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useAuthStore } from "../store/authStore";

type Mode = "login" | "signup" | "forgot";

interface FieldError {
  name?: string; phone?: string; email?: string; password?: string; confirm?: string;
}

function validate(mode: Mode, form: Record<string, string>): FieldError {
  const errs: FieldError = {};
  if (mode === "signup" && !form.name.trim()) errs.name = "Name is required";
  if (mode === "signup" && !/^\+?[\d\s-]{10,}$/.test(form.phone.trim()))
    errs.phone = "Enter a valid phone number";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "Enter a valid email address";
  if (mode !== "forgot" && form.password.length < 6)
    errs.password = "Password must be at least 6 characters";
  if (mode === "signup" && form.password !== form.confirm)
    errs.confirm = "Passwords do not match";
  return errs;
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#B02840]"
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LoginRoute() {
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [forgotSent, setForgotSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [k]: undefined }));
    setServerError("");
  };

  function switchMode(m: Mode) { setMode(m); setFieldErrors({}); setServerError(""); setForgotSent(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(mode, form);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setLoading(true); setServerError("");
    try {
      if (mode === "login") await login(form.email, form.password);
      else if (mode === "signup") await signup(form.name, form.phone, form.email, form.password);
      else { await new Promise((r) => setTimeout(r, 900)); setForgotSent(true); setLoading(false); return; }
      setDone(true);
      setTimeout(() => navigate({ to: "/account" }), 900);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  if (forgotSent) {
    return (
      <Screen top={<TopBar title="Reset password" showBack />}>
        <div className="flex flex-col items-center px-6 pt-20 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#D8F0D8]">
            <CheckCircle2 size={40} className="text-[#2A6030]" />
          </div>
          <h2 className="mb-2 font-serif text-[22px] font-bold text-deep">Check your inbox</h2>
          <p className="mb-6 text-[13px] font-semibold leading-relaxed text-ink-soft">
            We've sent a password reset link to <span className="text-deep">{form.email}</span>.
          </p>
          <button onClick={() => switchMode("login")} className="text-[13px] font-bold text-mauve underline underline-offset-2">
            Back to sign in
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen top={<TopBar title={mode === "forgot" ? "Reset password" : mode === "login" ? "Sign in" : "Create account"} showBack />}>
      <div className="px-5 pb-12 pt-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-7 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] text-[32px] shadow-glow">🎀</div>
          <h2 className="font-serif text-[24px] font-bold text-deep">
            {mode === "forgot" ? "Forgot your password?" : mode === "login" ? "Welcome back!" : "Join liltreats"}
          </h2>
          <p className="mt-1 text-[13px] font-semibold text-ink-soft">
            {mode === "forgot" ? "Enter your email and we'll send a reset link" : mode === "login" ? "Sign in to track your scoops and bookings" : "Create your account to start booking"}
          </p>
        </motion.div>

        {mode !== "forgot" && (
          <div className="mb-6 grid grid-cols-2 rounded-2xl border border-line bg-white/50 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`rounded-xl py-2.5 text-[13px] font-bold transition-all ${mode === m ? "bg-deep text-white shadow-sm" : "text-ink-soft hover:text-deep"}`}>
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-start gap-2 rounded-xl border border-[#F0C0C0] bg-[#FFF4F6] p-3 text-[12px] font-semibold text-[#B02840]">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />{serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <FieldWrap label="Full name" error={fieldErrors.name}>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                    <input value={form.name} onChange={upd("name")} placeholder="Your full name" className={`field-input !pl-10 ${fieldErrors.name ? "border-[#F0C0C0]" : ""}`} />
                  </div>
                </FieldWrap>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div key="phone" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <FieldWrap label="WhatsApp / Phone" error={fieldErrors.phone}>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                    <input type="tel" value={form.phone} onChange={upd("phone")} placeholder="+91 98765 43210" className={`field-input !pl-10 ${fieldErrors.phone ? "border-[#F0C0C0]" : ""}`} />
                  </div>
                </FieldWrap>
              </motion.div>
            )}
          </AnimatePresence>
          <FieldWrap label="Email address" error={fieldErrors.email}>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input type="email" value={form.email} onChange={upd("email")} placeholder="your@email.com" className={`field-input !pl-10 ${fieldErrors.email ? "border-[#F0C0C0]" : ""}`} />
            </div>
          </FieldWrap>
          {mode !== "forgot" && (
            <FieldWrap label="Password" error={fieldErrors.password}>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={upd("password")} placeholder="••••••••"
                  className={`field-input !pl-10 !pr-10 ${fieldErrors.password ? "border-[#F0C0C0]" : ""}`} minLength={6} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FieldWrap>
          )}
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div key="confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <FieldWrap label="Confirm password" error={fieldErrors.confirm}>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                    <input type={showConfirm ? "text" : "password"} value={form.confirm} onChange={upd("confirm")} placeholder="••••••••"
                      className={`field-input !pl-10 !pr-10 ${fieldErrors.confirm ? "border-[#F0C0C0]" : ""}`} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FieldWrap>
              </motion.div>
            )}
          </AnimatePresence>
          {mode === "login" && (
            <button type="button" onClick={() => switchMode("forgot")} className="ml-auto block text-[12px] font-bold text-mauve">Forgot password?</button>
          )}
          <button type="submit" disabled={loading || done}
            className={`btn-main mt-2 flex w-full items-center justify-center gap-2 transition-all ${done ? "bg-[#2A6030]" : ""}`}>
            {done ? <><CheckCircle2 size={16} /> Done! Redirecting…</> : loading
              ? <span className="flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Please wait…</span>
              : <>{mode === "forgot" ? "Send reset link" : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={16} /></>}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11px] font-bold text-ink-mute">or continue with</span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/70 py-3 text-[13px] font-bold text-deep">
                <span className="text-[18px]">🌐</span> Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/70 py-3 text-[13px] font-bold text-deep">
                <span className="text-[18px]">📱</span> OTP
              </button>
            </div>
          </>
        )}

        <p className="mt-5 text-center text-[13px] font-semibold text-ink-soft">
          {mode === "login" ? <>New to liltreats? <button onClick={() => switchMode("signup")} className="font-bold text-deep underline underline-offset-2">Create account</button></>
            : mode === "signup" ? <>Already have an account? <button onClick={() => switchMode("login")} className="font-bold text-deep underline underline-offset-2">Sign in</button></>
            : <>Remembered it? <button onClick={() => switchMode("login")} className="font-bold text-deep underline underline-offset-2">Back to sign in</button></>}
        </p>
        <p className="mt-4 text-center text-[11px] font-semibold leading-relaxed text-ink-mute">
          By continuing you agree to liltreats' Terms of Service and Privacy Policy.
        </p>

        {/* Demo credentials — remove before launch */}
        <div className="mt-5 rounded-xl border border-dashed border-gold/50 bg-gold/5 p-3">
          <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-gold">
            Demo accounts
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Customer", email: "customer@liltreats.com", pass: "Customer@123" },
              { label: "Admin", email: "admin@liltreats.com", pass: "Admin@123" },
            ].map(({ label, email, pass }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, email, password: pass }));
                  setMode("login");
                }}
                className="flex w-full items-center justify-between rounded-lg bg-white/60 px-3 py-2 text-left"
              >
                <span className="text-[11px] font-bold text-deep">{label}</span>
                <span className="text-[10px] font-semibold text-ink-mute">{email}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-center text-[9px] font-semibold text-ink-mute">
            Tap a row to auto-fill, then sign in
          </p>
        </div>
      </div>
    </Screen>
  );
}
