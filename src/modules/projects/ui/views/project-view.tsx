"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Suspense } from "react";
import { MessagesContainer } from "../components/messages-container";
interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
//   const trpc = useTRPC();
//   const { data: project } = useSuspenseQuery(
//     trpc.projects.getOne.queryOptions({
//       id: projectId,
//     })
//   );


  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
         <Suspense fallback={<div>Loading project...</div>}></Suspense>
        <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
            <MessagesContainer projectId={projectId}/>
        </ResizablePanel>
        <Suspense/>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>TODO Preview</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
