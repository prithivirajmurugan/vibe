import { Suspense  } from "react";
import { dehydrate,  HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { Client } from "./client"; 

const Page = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({text: "LET PREFETCH"}))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
}
    <div>
      {JSON.stringify(data)}
    </div>
  );

}


export default Page;