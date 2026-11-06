import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{message?:string;q?:string;source?:string}>}){return <WorkspaceView view="leads" searchParams={searchParams}/>}
