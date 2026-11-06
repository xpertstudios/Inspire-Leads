"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const OFFICE_TIMEZONE="Africa/Lagos";
const SOURCES=["In person","Online","Flyer","Referral","Event","Other"];
function officeDate(date=new Date()){return new Intl.DateTimeFormat("en-CA",{timeZone:OFFICE_TIMEZONE,year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
function normalizePhone(value:string){const digits=value.replace(/\D/g,"");return digits.startsWith("0")&&digits.length===11?`234${digits.slice(1)}`:digits}
export async function createLead(formData:FormData){
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/login");
  const name=String(formData.get("name")||"").trim(),phone=String(formData.get("phone")||"").trim(),area=String(formData.get("area")||"").trim(),source=String(formData.get("source")||""),normalizedPhone=normalizePhone(phone);
  if(!name||!area||!SOURCES.includes(source)||normalizedPhone.length<10||formData.get("consent")!=="yes")redirect("/leads/new?error=Complete+every+required+field+and+confirm+consent.");
  const {error}=await supabase.from("leads").insert({owner_id:user.id,name,phone,normalized_phone:normalizedPhone,area,source,consent_confirmed:true,office_date:officeDate()});
  if(error?.code==="23505")redirect("/leads/new?error=This+phone+number+already+exists."); if(error)redirect(`/leads/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");revalidatePath("/leads");redirect("/leads?message=Lead+saved+and+locked.");
}
