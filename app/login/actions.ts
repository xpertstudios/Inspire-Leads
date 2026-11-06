"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PRODUCTION_SITE_URL = "https://inspire-leads-phi.vercel.app";

function confirmationUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const siteUrl = configured?.startsWith("https://") && !configured.includes("chatgpt.site")
    ? configured
    : PRODUCTION_SITE_URL;
  return `${siteUrl}/auth/confirm?next=/`;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName || !email || password.length < 8) redirect("/login?mode=signup&error=Enter+your+full+name,+email,+and+a+password+of+at+least+8+characters.");
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: confirmationUrl() } });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Account+created.+Check+your+email+and+tap+the+confirmation+link+before+signing+in.");
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  if (!email) redirect("/login?error=Enter+your+email+address+first.");
  const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmationUrl() } });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?message=A+new+confirmation+email+has+been+sent.");
}

export async function signout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login"); }
