import { openai , createAgent } from '@inngest/agent-kit'
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox } from './utils';

export const helloworld = inngest.createFunction(
    { id: "hello-world"},
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const sandboxId = await step.run('get-sandbox-id', async () => {
            const sandbox = await Sandbox.create('vibe-nextjs-test-asd-2');
            return sandbox.sandboxId;
        })
        const summarizer = createAgent({
            name: "summarizer",
            system: "You are an expert summarizer. You summarize in 2 words",
            model: openai({model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY}),
        });

        const { output } = await summarizer.run(
            'Summarize the following text in 2 words: ' + event.data.value,
        )

        const sandboxUrl = await step.run('get-sandbox-url', async () => { 
            const sandbox = await getSandbox(sandboxId);
            const host =  sandbox.getHost(3000);
            return `https://${host}`
        })
        return { output, sandboxUrl };
    }
);

export const functions = [helloworld];