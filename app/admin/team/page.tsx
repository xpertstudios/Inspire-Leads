import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{date?:string;member?:string}>}){return <WorkspaceView view="team" searchParams={searchParams}/>}
