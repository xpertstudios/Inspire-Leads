import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{q?:string;source?:string}>}){return <WorkspaceView view="admin-leads" searchParams={searchParams}/>}
