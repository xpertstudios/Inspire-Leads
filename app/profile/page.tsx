import {WorkspaceView} from "@/app/workspace-view";
export default function Page({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){return <WorkspaceView view="profile" searchParams={searchParams}/>}
