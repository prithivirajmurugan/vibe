import { openai , createAgent } from '@inngest/agent-kit'
import { inngest } from "./client";

export const helloworld = inngest.createFunction(
    { id: "hello-world"},
    { event: "test/hello.world" },
    async ({ event }) => {
        const summarizer = createAgent({
            name: "summarizer",
            system: "You are an expert summarizer. You summarize in 2 words",
            model: openai({model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY}),
        });

        const { output } = await summarizer.run(
            'Summarize the following text in 2 words: ' + event.data.value,
        )
        console.log("Summarized output:", output);
        return { output };
    }
);

export const functions = [helloworld];