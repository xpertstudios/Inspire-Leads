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

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("email rate limit exceeded") || normalized.includes("over_email_send_rate_limit")) {
    return "Too many confirmation emails were requested. Please wait one hour, then request only one new email. You can still sign in if you already confirmed your account.";
  }
  if (normalized.includes("invalid login credentials")) {
    return "The email or password is incorrect. If you just created the account, confirm your email before signing in.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email from the latest message in your inbox before signing in.";
  }
  return message;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(friendlyAuthError(error.message))}`);
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName || !email || password.length < 8) redirect("/login?mode=signup&error=Enter+your+full+name,+email,+and+a+password+of+at+least+8+characters.");
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: confirmationUrl() } });
  if (error) redirect(`/login?mode=signup&error=${encodeURIComponent(friendlyAuthError(error.message))}`);
  redirect("/login?message=Account+created.+Check+your+email+and+tap+the+confirmation+link+before+signing+in.");
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "").trim();
  if (!email) redirect("/login?error=Enter+your+email+address+first.");
  const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmationUrl() } });
  if (error) redirect(`/login?mode=signup&error=${encodeURIComponent(friendlyAuthError(error.message))}`);
  redirect("/login?mode=signup&message=A+new+confirmation+email+has+been+sent.+Use+only+the+latest+email.");
}

export async function signout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login"); }
