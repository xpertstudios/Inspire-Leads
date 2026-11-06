import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{message?:string}>}){return <WorkspaceView view="leads" searchParams={searchParams}/>}
