import Link from "next/link";
import { Sparkles } from "lucide-react";
import { login, resendConfirmation, signup } from "./actions";

const inputClass = "min-h-12 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-base outline-none focus:border-[#2586e8]";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; mode?: string }> }) {
  const params = await searchParams;
  const signingUp = params.mode === "signup";

  return <main className="grid min-h-dvh place-items-center bg-[#f4f7fb] p-5">
    <section className="w-full max-w-md rounded-[30px] bg-[#081b3a] p-7 text-white shadow-2xl sm:p-10">
      <span className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-[#1976d2] text-white"><Sparkles/></span>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#77bbff]">WINSPIRE OFFICE</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{signingUp ? "Create your account" : "Welcome to INSPIRE Leads"}</h1>
      <p className="mt-2 text-sm text-[#b9cce3]">{signingUp ? "Register with your email, then confirm it from your inbox." : "Sign in to capture and follow up with your leads."}</p>
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-white/10 p-1 text-sm font-semibold"><Link href="/login" className={`rounded-lg px-3 py-2.5 text-center ${!signingUp ? "bg-[#2586e8] text-white" : "text-[#b9cce3]"}`}>Sign in</Link><Link href="/login?mode=signup" className={`rounded-lg px-3 py-2.5 text-center ${signingUp ? "bg-[#2586e8] text-white" : "text-[#b9cce3]"}`}>Create account</Link></div>
      {params.error ? <p className="mt-5 rounded-xl bg-red-400/15 p-3 text-sm text-red-100">{params.error}</p> : null}
      {params.message ? <p className="mt-5 rounded-xl bg-blue-400/15 p-3 text-sm text-blue-100">{params.message}</p> : null}
      <form className="mt-6 space-y-4">
        {signingUp ? <label className="block"><span className="mb-1.5 block text-xs text-[#d5e2f2]">Full name</span><input name="fullName" required autoComplete="name" className={inputClass}/></label> : null}
        <label className="block"><span className="mb-1.5 block text-xs text-[#d5e2f2]">Email</span><input name="email" type="email" required autoComplete="email" className={inputClass}/></label>
        <label className="block"><span className="mb-1.5 block text-xs text-[#d5e2f2]">Password</span><input name="password" type="password" required minLength={8} autoComplete={signingUp ? "new-password" : "current-password"} className={inputClass}/></label>
        <button formAction={signingUp ? signup : login} className="min-h-12 w-full rounded-xl bg-[#2586e8] px-3 font-semibold text-white">{signingUp ? "Create account and email confirmation" : "Sign in"}</button>
        {signingUp ? <button formAction={resendConfirmation} formNoValidate className="min-h-10 w-full text-sm font-medium text-[#77bbff] underline decoration-[#77bbff]/40 underline-offset-4">Resend confirmation email</button> : null}
      </form>
      <p className="mt-5 text-xs leading-relaxed text-[#91a9c5]">{signingUp ? "You must confirm your email before you can sign in." : "New here? Select Create account above."}</p>
    </section>
  </main>;
}
