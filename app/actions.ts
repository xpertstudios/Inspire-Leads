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
  const name=String(formData.get("name")||"").trim(),phone=String(formData.get("phone")||"").trim(),area=String(formData.get("area")||"").trim(),source=String(formData.get("source")||""),notes=String(formData.get("notes")||"").trim(),normalizedPhone=normalizePhone(phone);
  if(!name||!area||!SOURCES.includes(source)||normalizedPhone.length<10||formData.get("consent")!=="yes")redirect("/leads/new?error=Complete+every+required+field+and+confirm+consent.");
  const {error}=await supabase.from("leads").insert({owner_id:user.id,name,phone,normalized_phone:normalizedPhone,area,source,notes:notes||null,consent_confirmed:true,office_date:officeDate()});
  if(error?.code==="23505")redirect("/leads/new?error=This+phone+number+already+exists."); if(error)redirect(`/leads/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");revalidatePath("/leads");redirect("/leads?message=Lead+saved+and+locked.");
}

export async function recordFollowup(formData:FormData){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
  const leadId=String(formData.get("leadId")||""),contactMethod=String(formData.get("contactMethod")||""),outcome=String(formData.get("outcome")||""),notes=String(formData.get("notes")||"").trim(),nextDate=String(formData.get("nextFollowupDate")||"");
  const methods=["WhatsApp","Phone","SMS","In person","Email","Other"],outcomes=["No response","Contacted","Interested","Follow-up Needed","Not Interested","Converted","Do Not Contact"];
  if(!leadId||!methods.includes(contactMethod)||!outcomes.includes(outcome))redirect(`/leads/${leadId}?error=Complete+the+follow-up+form.`);
  const {error}=await supabase.from("lead_followups").insert({lead_id:leadId,member_id:user.id,contact_method:contactMethod,outcome,notes:notes||null,next_followup_date:nextDate||null});
  if(error)redirect(`/leads/${leadId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/follow-ups");revalidatePath(`/leads/${leadId}`);redirect(`/leads/${leadId}?message=Follow-up+recorded.`);
}

export async function savePreferences(formData:FormData){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
  const displayName=String(formData.get("displayName")||"").trim(),phone=String(formData.get("phone")||"").trim(),whatsappMessage=String(formData.get("whatsappMessage")||"").trim();
  if(!displayName)redirect("/profile?error=Full+name+is+required.");
  const [{error:profileError},{error:preferenceError}]=await Promise.all([supabase.from("profiles").update({display_name:displayName,updated_at:new Date().toISOString()}).eq("id",user.id),supabase.from("member_preferences").upsert({member_id:user.id,phone:phone||null,whatsapp_message:whatsappMessage||undefined,updated_at:new Date().toISOString()})]);
  const error=profileError||preferenceError;if(error)redirect(`/profile?error=${encodeURIComponent(error.message)}`);revalidatePath("/profile");redirect("/profile?message=Preferences+saved.");
}

export async function saveOfficeSettings(formData:FormData){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
  const officeName=String(formData.get("officeName")||"").trim(),dailyTarget=Number(formData.get("dailyTarget"));
  if(!officeName||!Number.isInteger(dailyTarget)||dailyTarget<1||dailyTarget>100)redirect("/admin/settings?error=Enter+a+valid+office+name+and+daily+target.");
  const {error}=await supabase.from("office_settings").update({office_name:officeName,daily_target:dailyTarget,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",true);
  if(error)redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);revalidatePath("/admin/settings");redirect("/admin/settings?message=Office+settings+saved.");
}
