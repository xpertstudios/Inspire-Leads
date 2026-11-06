import Link from "next/link";
import {ArrowLeft,LockKeyhole,MapPin,MessageCircle,ShieldCheck} from "lucide-react";
import {notFound} from "next/navigation";
import {recordFollowup} from "@/app/actions";
import {InspireShell} from "@/components/inspire-shell";
import {getWorkspaceData} from "@/lib/inspire-data";

export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;message?:string}>}){
  const [{id},notice]=await Promise.all([params,searchParams]),d=await getWorkspaceData(),lead=d.leads.find(l=>l.id===id);
  if(!lead)notFound();
  const leadFollowups=d.followups.filter(f=>f.lead_id===id);
  return <InspireShell isAdmin={d.isAdmin} displayName={d.profile.display_name}>
    <Link href={d.isAdmin?"/admin/leads":"/leads"} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1565c0]"><ArrowLeft size={17}/>Back to leads</Link>
    {notice.error?<p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{notice.error}</p>:null}
    {notice.message?<p className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{notice.message}</p>:null}
    <div className="grid gap-5 xl:grid-cols-[1fr_.65fr]">
      <section className="rounded-2xl border border-[#dce6f1] bg-white p-6">
        <div className="flex items-start justify-between"><div><p className="text-sm text-[#72849a]">Lead details</p><h1 className="mt-1 text-3xl font-bold">{lead.name}</h1><p className="mt-2 text-lg text-[#596f8a]">{lead.phone}</p></div><span className="rounded-full bg-[#e7f1ff] px-3 py-1 text-xs font-semibold text-[#1565c0]">{leadFollowups[0]?.outcome||lead.status}</span></div>
        <div className="mt-7 grid gap-4 rounded-xl bg-[#f6f9fd] p-5 sm:grid-cols-2"><p><small className="block text-[#7b8a9d]">Location</small><b className="mt-1 flex items-center gap-1"><MapPin size={15}/>{lead.area}</b></p><p><small className="block text-[#7b8a9d]">Source</small><b>{lead.source}</b></p><p><small className="block text-[#7b8a9d]">Submitted</small><b>{lead.office_date}</b></p><p><small className="block text-[#7b8a9d]">Owner</small><b>{lead.ownerName||d.profile.display_name}</b></p>{lead.notes?<p className="sm:col-span-2"><small className="block text-[#7b8a9d]">Notes</small><span>{lead.notes}</span></p>:null}</div>
        <a href={`/api/leads/${lead.id}/whatsapp`} target="_blank" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#16824f] px-5 font-semibold text-white"><MessageCircle size={18}/>Open WhatsApp</a>
        {leadFollowups.length?<div className="mt-7 border-t pt-5"><h2 className="font-bold">Follow-up history</h2>{leadFollowups.map(f=><div key={f.id} className="mt-3 rounded-xl bg-[#f6f9fd] p-4 text-sm"><b>{f.contact_method} · {f.outcome}</b><p className="text-[#718399]">{f.notes||"No notes"}{f.next_followup_date?` · Next: ${f.next_followup_date}`:""}</p></div>)}</div>:null}
      </section>
      <div className="space-y-5">
        <section className="rounded-2xl border border-[#dce6f1] bg-white p-6"><h2 className="text-lg font-bold">Record follow-up</h2><form action={recordFollowup} className="mt-5 space-y-4"><input type="hidden" name="leadId" value={lead.id}/><label className="block"><span className="mb-1 block text-sm font-semibold">Contact method</span><select name="contactMethod" required className="min-h-11 w-full rounded-xl border px-3"><option>WhatsApp</option><option>Phone</option><option>SMS</option><option>In person</option><option>Email</option><option>Other</option></select></label><label className="block"><span className="mb-1 block text-sm font-semibold">Outcome</span><select name="outcome" required className="min-h-11 w-full rounded-xl border px-3"><option>No response</option><option>Contacted</option><option>Interested</option><option>Follow-up Needed</option><option>Not Interested</option><option>Converted</option><option>Do Not Contact</option></select></label><label className="block"><span className="mb-1 block text-sm font-semibold">Next follow-up date</span><input type="date" name="nextFollowupDate" className="min-h-11 w-full rounded-xl border px-3"/></label><label className="block"><span className="mb-1 block text-sm font-semibold">Notes</span><textarea name="notes" rows={3} className="w-full rounded-xl border p-3"/></label><button className="min-h-11 w-full rounded-xl bg-[#1565c0] px-5 font-semibold text-white">Save follow-up</button></form></section>
        <section className="rounded-2xl border border-[#dce6f1] bg-white p-6"><ShieldCheck className="mb-4 text-[#1565c0]"/><h2 className="text-lg font-bold">Protected submission</h2><p className="mt-2 text-sm leading-relaxed text-[#718399]">Original contact information is locked. Follow-up outcomes are stored separately.</p><div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f1f6fc] p-4 text-sm"><LockKeyhole size={17}/>Read-only record</div></section>
      </div>
    </div>
  </InspireShell>;
}
