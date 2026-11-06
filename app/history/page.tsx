import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{period?:string}>}){return <WorkspaceView view="history" searchParams={searchParams}/>}
