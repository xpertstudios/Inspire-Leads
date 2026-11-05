"use client";

import { BarChart3, Download, Home, PlusCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function MobileAppShell() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [hasDashboard, setHasDashboard] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
    setHasDashboard(Boolean(document.getElementById("overview")));
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return <>
    {installPrompt ? <button onClick={install} className="fixed right-4 top-[72px] z-30 flex items-center gap-2 rounded-full bg-[#d8f06a] px-4 py-2.5 text-xs font-semibold text-[#173f31] shadow-lg sm:hidden"><Download size={15}/> Install app</button> : null}
    {hasDashboard ? <nav aria-label="Mobile navigation" className="mobile-tabbar fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-around border-t border-[#dce5dc] bg-white/95 px-2 pt-2 backdrop-blur-xl lg:hidden">
      <MobileLink href="#overview" label="Home" icon={<Home/>}/>
      <MobileLink href="#capture" label="Add lead" icon={<PlusCircle/>} featured/>
      <MobileLink href="#leads" label="Leads" icon={<Users/>}/>
      <MobileLink href="#performance" label="Reports" icon={<BarChart3/>}/>
    </nav> : null}
  </>;
}

function MobileLink({href,label,icon,featured=false}:{href:string;label:string;icon:React.ReactNode;featured?:boolean}) {
  return <a href={href} className={`flex min-w-16 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-medium ${featured ? "-mt-6 bg-[#173f31] py-3 text-white shadow-xl" : "text-[#667b70]"}`}><span className="[&_svg]:h-5 [&_svg]:w-5">{icon}</span>{label}</a>;
}
