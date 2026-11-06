import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{error?:string}>}){return <WorkspaceView view="new" searchParams={searchParams}/>}
