import { openai , createAgent, createTool, createNetwork, type Tool, Message, createState } from '@inngest/agent-kit'
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox, lastAssisantTextMessageContent } from './utils';
import { z } from 'zod';
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@/prompt';
import prisma from '@/lib/db';

interface AgentState {
    summary: string;
    files: { [path:string]: string };

}
export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent"},
    { event: "code-agent/run" },
    async ({ event, step }) => {
        const sandboxId = await step.run('get-sandbox-id', async () => {
            const sandbox = await Sandbox.create('vibe-nextjs-test-asd-2');
            await sandbox.setTimeout(60_000 * 10 * 3); // 1 hour timeout
            return sandbox.sandboxId;
        })

        const previousMessages = await step.run('get-previous-messages', async () => {
            const formattedMessages:Message[] = []
            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
            });
            for (const message of messages) {
                formattedMessages.push({
                    role: message.role === "ASSISTANT" ? "assistant" : "user",
                    content: message.content,
                    type: 'text',
                });
            }
            return formattedMessages.reverse(); // Reverse to maintain chronological order
        })

        const state = createState<AgentState>({
            summary: "",
            files: {},
        },{
            messages: previousMessages,
        })
        
        const codeAgent = createAgent<AgentState> ({
            name: "code-agent",
            description: "An agent that can write code and run it in a sandbox",
            system: PROMPT,
            model: openai({model: "gpt-4.1",
            defaultParameters: { temperature: 0.1 },
             apiKey: process.env.OPENAI_API_KEY}),
            tools:[
            createTool({
                name:"terminal",
                description: "Use the terminal to run the commands",
                parameters: z.object({
                command: z.string().describe("The command to run in the terminal"),
                // eslint-disable-next-line
                }) as any,
                handler: async ({command}, {step}) => { 
                return await step?.run("terminal", async () => {
                    const buffers = {stdout: "", stderr: ""};
                    try {
                    const sandbox = await getSandbox(sandboxId);
                    const result = await sandbox.commands.run(command, {
                    onStdout: (data:string) => {
                        buffers.stdout += data;
                    },
                    onStderr: (data:string) => {
                        buffers.stderr += data;
                    }
                    })
                    return result.stdout;
                }
                catch (error) {
                    const res = `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                    console.log(res);
                    return res;
                }
                })
                }
            }),
            createTool({
                name: "createOrUpdateFiles",
                description: "Create or update files in the sandbox",
                parameters: z.object({
                files: z.array(z.object({
                    path: z.string(),
                    content: z.string().describe("The content of the file to create or update"),
                })),
                // eslint-disable-next-line
                }) as any,
                handler: async ({files}, {step, network}:Tool.Options<AgentState>) => {
                const newFiles = await step?.run("createOrUpdateFiles", async () => {
                    try {
                    const updatedFiles = network.state.data.files || {};
                    const sandbox = await getSandbox(sandboxId);
                    for (const file of files) {
                        await sandbox.files.write(file.path, file.content);
                        updatedFiles[file.path] = file.content; 
                    }
                    return updatedFiles;
                    } catch (error) {
                    return "Error: " + error;
                    }
                });
                if (typeof newFiles === 'object') {
                    network.state.data.files = newFiles;
                }
                }
            }),
            createTool({
                name: "readFiles",
                description: "Read files from the sandbox",
                parameters: z.object({
                paths: z.array(z.string()).describe("The paths of the files to read"),
                // eslint-disable-next-line
                }) as any,
                handler: async ({paths}, {step}) => {
                return await step?.run("readFiles", async () => {
                    try {
                    const sandbox = await getSandbox(sandboxId);
                    const fileContents = [];
                    for (const path of paths) {
                        const content = await sandbox.files.read(path);
                        fileContents.push({ path: path, content });
                    }
                    return JSON.stringify(fileContents, null, 2);
                    } catch (error) {
                    return "Error: " + error;
                    }
                });
                }
            })
            ],
            lifecycle:{
            onResponse: async ({ result, network }) => { 
                const lastAssisantMessageText = lastAssisantTextMessageContent(result);
                if (lastAssisantMessageText && network) {
                if(lastAssisantMessageText.includes("<task_summary>")){
                    network.state.data.summary = lastAssisantMessageText
                }
                }
                return result
            }
            },
        });

        const network = createNetwork<AgentState>({
            name : "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async({network}) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }
            return codeAgent;
            }
        })

        const result = await network.run(event.data.value, { state });


        const fragmentTitleGenerator = createAgent({
            name: "fragment-title-generator",
            description: "fragment title generator",
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({model: "gpt-4o",
             apiKey: process.env.OPENAI_API_KEY}),
        });

       const responseGenerator = createAgent({
            name: "response-generator",
            description: "A response generator",
            system: RESPONSE_PROMPT,
            model: openai({model: "gpt-4o",
             apiKey: process.env.OPENAI_API_KEY}),
        });

        const { output : fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary)
        const { output : responseOutput } = await responseGenerator.run(result.state.data.summary)

        const extractTextContent = (output: Message[], fallback: string) => {
            if (!output || output.length === 0 || output[0].type !== 'text') {
                return fallback;
            }
            const content = output[0].content;
            if (Array.isArray(content)) {
                return content.map((item: string | { text?: string }) => typeof item === 'string' ? item : item.text || '').join("");
            } else {
                return content;
            }
        }

        const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0;
    

        const sandboxUrl = await step.run('get-sandbox-url', async () => { 
            const sandbox = await getSandbox(sandboxId);
            const host =  sandbox.getHost(3000);
            return `https://${host}`
        })

        await step.run("save-result", async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: "Something went wrong, please try again",
                        role: "ASSISTANT",
                        type: "ERROR",
                    }
                })
            }
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: extractTextContent(responseOutput, "Here you go"),
                    role: "ASSISTANT",
                    type: "RESULT",
                    fragment:{
                        create: {
                            sandboxUrl: sandboxUrl,
                            title: extractTextContent(fragmentTitleOutput, "Fragment"),
                            files: result.state.data.files,
                        }
                    }
                }
            })
        })


        return { url: sandboxUrl, title: "Fragment" , files: result.state.data.files, summary: result.state.data.summary  };
    }
);

export const functions = [codeAgentFunction];