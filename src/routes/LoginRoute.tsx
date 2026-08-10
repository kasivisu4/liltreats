import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Phone, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";

type Mode = "login" | "signup";

export function LoginRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.email.trim() && form.password.trim() &&
    (mode === "login" || (form.name.trim() && form.phone.trim()));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    // Simulate auth — replace with Supabase auth when wired up
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate({ to: "/account" }), 900);
    }, 1200);
  }

  return (
    <Screen top={<TopBar title={mode === "login" ? "Sign in" : "Create account"} showBack />}>
      <div className="px-5 pb-10 pt-6">
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 text-center"
        >
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] text-[32px] shadow-glow">
            🎀
          </div>
          <h2 className="font-serif text-[24px] font-bold text-deep">
            {mode === "login" ? "Welcome back!" : "Join liltreats"}
          </h2>
          <p className="mt-1 text-[13px] font-semibold text-ink-soft">
            {mode === "login"
              ? "Sign in to track your scoops and bookings"
              : "Create your account to start booking"}
          </p>
        </motion.div>

        {/* Tab toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-2xl border border-line bg-white/50 p-1">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl py-2.5 text-[13px] font-bold transition-all ${
                mode === m
                  ? "bg-deep text-white shadow-sm"
                  : "text-ink-soft hover:text-deep"
              }`}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="field-label">Full name</label>
              <div className="relative">
                <input
                  value={form.name}
                  onChange={upd("name")}
                  placeholder="Your name"
                  className="field-input !pl-10"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px]">👤</span>
              </div>
            </motion.div>
          )}

          {mode === "signup" && (
            <div>
              <label className="field-label">WhatsApp / Phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={upd("phone")}
                  placeholder="+91 98765 43210"
                  className="field-input !pl-10"
                  required={mode === "signup"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="field-label">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input
                type="email"
                value={form.email}
                onChange={upd("email")}
                placeholder="your@email.com"
                className="field-input !pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={upd("password")}
                placeholder="••••••••"
                className="field-input !pl-10 !pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <button
              type="button"
              className="ml-auto block text-[12px] font-bold text-mauve"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`btn-main mt-2 flex items-center justify-center gap-2 transition-all ${
              success ? "bg-[#2A6030]" : ""
            }`}
          >
            {success ? (
              "Success! Redirecting… ✓"
            ) : loading ? (
              "Please wait…"
            ) : (
              <>
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-bold text-ink-mute">or continue with</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* Social options */}
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/70 py-3 text-[13px] font-bold text-deep">
            <span className="text-[18px]">🌐</span> Google
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/70 py-3 text-[13px] font-bold text-deep">
            <span className="text-[18px]">📱</span> OTP
          </button>
        </div>

        {/* Switch mode */}
        <p className="mt-5 text-center text-[13px] font-semibold text-ink-soft">
          {mode === "login" ? "New to liltreats? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-bold text-deep underline underline-offset-2"
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        <p className="mt-4 text-center text-[11px] font-semibold leading-relaxed text-ink-mute">
          By continuing you agree to liltreats' Terms of Service and Privacy Policy.
        </p>
      </div>
    </Screen>
  );
}
