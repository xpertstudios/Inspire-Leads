"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Bell, ClipboardList, Contact, History, LayoutDashboard, Menu,
  MessageCircleMore, Plus, Settings, Sparkles, Target, Users, X,
} from "lucide-react";
import { useState } from "react";

const memberLinks = [
  ["Dashboard", "/", LayoutDashboard], ["Add New Lead", "/leads/new", Plus],
  ["My Leads", "/leads", Contact], ["Lead History", "/history", History],
  ["Follow-ups", "/follow-ups", MessageCircleMore], ["My Performance", "/performance", Target],
  ["Profile & Settings", "/profile", Settings],
] as const;
const adminLinks = [
  ["Admin Dashboard", "/admin", LayoutDashboard], ["Team Members", "/admin/team", Users],
  ["All Leads", "/admin/leads", ClipboardList], ["Reports", "/admin/reports", BarChart3],
  ["Office Settings", "/admin/settings", Settings],
] as const;

export function InspireShell({ children, isAdmin, displayName }: { children: React.ReactNode; isAdmin: boolean; displayName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? [...memberLinks, ...adminLinks] : memberLinks;
  const mobile = isAdmin ? adminLinks.slice(0, 4) : memberLinks.slice(0, 4);

  return <div className="min-h-dvh bg-[#f4f7fb] text-[#14213d]">
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#dbe5f1] bg-[#081b3a] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1976d2]"><Sparkles size={20}/></span><span><b className="block tracking-wide">INSPIRE Leads</b><small className="text-[#9db7d8]">WINSPIRE OFFICE</small></span></Link>
        <button type="button" aria-label="Close menu" className="lg:hidden" onClick={() => setOpen(false)}><X/></button>
      </div>
      <nav className="h-[calc(100dvh-9rem)] overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f91ba]">Workspace</p>
        {links.map(([label, href, Icon], i) => <div key={href}>{isAdmin && i === memberLinks.length ? <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f91ba]">Administration</p> : null}<Link href={href} onClick={() => setOpen(false)} className={`mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm ${pathname === href ? "bg-[#1976d2] text-white" : "text-[#c5d4e7] hover:bg-white/8 hover:text-white"}`}><Icon size={18}/>{label}</Link></div>)}
      </nav>
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#081b3a] p-4"><p className="truncate text-sm font-semibold">{displayName}</p><p className="text-xs text-[#88a5c8]">{isAdmin ? "Administrator" : "Member"}</p></div>
    </aside>
    {open ? <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-[#06142a]/60 lg:hidden" onClick={() => setOpen(false)}/> : null}
    <div className="lg:pl-72">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#dbe5f1] bg-white/95 px-4 backdrop-blur sm:px-7">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe5f1] lg:hidden"><Menu/></button>
        <div className="hidden lg:block"><p className="text-sm font-semibold">WINSPIRE OFFICE</p><p className="text-xs text-[#6f7f96]">Africa/Lagos · closes 12:00 AM WAT</p></div>
        <div className="ml-auto flex items-center gap-2"><Link href="/follow-ups" aria-label="Open follow-ups" className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe5f1] text-[#63758e] hover:bg-[#eef5fc]"><Bell size={18}/></Link><span className="grid h-10 w-10 place-items-center rounded-full bg-[#dcecff] font-semibold text-[#1558a5]">{displayName[0]?.toUpperCase()}</span></div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-7 sm:py-8 lg:pb-10">{children}</main>
    </div>
    <nav className="mobile-tabbar fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#dbe5f1] bg-white px-2 pt-2 lg:hidden">
      {mobile.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] ${pathname === href ? "text-[#1565c0]" : "text-[#75859a]"}`}><Icon size={19}/><span>{label.replace("Admin ", "").replace("New ", "")}</span></Link>)}
      <button type="button" onClick={() => setOpen(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-[#75859a]"><Menu size={19}/><span>More</span></button>
    </nav>
  </div>;
}
