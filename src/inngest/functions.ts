import { inngest } from "./client";

export const helloworld = inngest.createFunction(
    { id: "helloworld", name: "Hello World" },
    { event: "vibe.helloworld" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return {
            data: {
                message: `Hello, ${event.data.name || "World"}!`
            }
        };
    }
);

export const functions = [helloworld];