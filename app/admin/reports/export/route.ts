import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

function csv(value:unknown){return `"${String(value??"").replaceAll('"','""')}"`}
type NamedRelation={display_name:string|null}|Array<{display_name:string|null}>|null;
type ExportLead={name:string;phone:string;area:string;source:string;office_date:string;status:string;legacy_members:NamedRelation;profiles:NamedRelation};
function relationName(value:NamedRelation){return Array.isArray(value)?value[0]?.display_name:value?.display_name}

export async function GET(){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.redirect(new URL("/login",process.env.NEXT_PUBLIC_SITE_URL));
  const {data:roles}=await supabase.from("user_roles").select("role").eq("user_id",user.id);
  if(!roles?.some(r=>r.role==="admin"||r.role==="super_admin"))return new NextResponse("Forbidden",{status:403});
  const {data,error}=await supabase.from("leads").select("name,phone,area,source,office_date,status,legacy_members!leads_legacy_owner_id_fkey(display_name),profiles!leads_owner_id_fkey(display_name)").order("created_at",{ascending:false});
  if(error)return new NextResponse(error.message,{status:500});
  const header=["Lead name","Phone","Location","Source","Date","Status","Member"];
  const rows=((data??[]) as unknown as ExportLead[]).map(lead=>[lead.name,lead.phone,lead.area,lead.source,lead.office_date,lead.status,relationName(lead.legacy_members)??relationName(lead.profiles)??"Member"].map(csv).join(","));
  return new NextResponse([header.map(csv).join(","),...rows].join("\n"),{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":"attachment; filename=inspire-leads-report.csv"}});
}
