"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { loginUser, resetUserPassword } from "@/lib/auth";

const getLoginError = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Emailul sau parola sunt incorecte.";
  if (code.includes("too-many-requests")) return "Au fost prea multe încercări. Te rugăm să încerci din nou mai târziu.";
  if (code.includes("network-request-failed")) return "Conexiunea la internet nu este disponibilă. Verifică rețeaua și încearcă din nou.";
  return "Autentificarea nu a reușit. Te rugăm să încerci din nou.";
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      router.push("/dashboard");
    } catch (loginError) {
      setError(getLoginError(loginError));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Introdu mai întâi adresa de email în câmpul de mai sus.");
      return;
    }
    setResetting(true);
    try {
      await resetUserPassword(email.trim());
      setMessage("Am trimis linkul pentru resetarea parolei. Verifică și folderul Spam.");
    } catch (resetError) {
      const code = typeof resetError === "object" && resetError && "code" in resetError ? String(resetError.code) : "";
      setError(code.includes("invalid-email") ? "Adresa de email nu este validă." : "Linkul de resetare nu a putut fi trimis. Încearcă din nou.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} noValidate className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><LockKeyhole aria-hidden="true" /></div>
        <h1 className="text-3xl font-bold text-slate-900">Autentificare</h1>
        <p className="mt-2 text-sm text-slate-500">Intră în cont pentru a administra activitatea service-ului.</p>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

      <div className="space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" aria-hidden="true" />
            <input id="login-email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="nume@companie.ro" />
          </div>
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Parolă</label>
          <div className="relative">
            <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required
              className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Introdu parola" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ascunde parola" : "Afișează parola"}
              className="absolute right-2 top-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <button type="button" onClick={handleReset} disabled={resetting} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-60">
        {resetting ? "Se trimite linkul..." : "Am uitat parola"}
      </button>

      <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Se verifică...</> : "Autentifică-te"}
      </button>
      <p className="mt-5 text-center text-sm text-slate-500">Nu ai acces? <Link href="/contact" className="font-semibold text-blue-600 hover:underline">Contactează echipa</Link></p>
    </form>
  );
}
