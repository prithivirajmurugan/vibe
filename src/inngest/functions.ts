import { openai , createAgent, createTool, createNetwork, type Tool } from '@inngest/agent-kit'
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox, lastAssisantTextMessageContent } from './utils';
import { z } from 'zod';
import { PROMPT } from '@/prompt';
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
            return sandbox.sandboxId;
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
            router: async({network}) => {
                const summary = network.state.data.summary;
                if (summary) {
                    return;
                }
            return codeAgent;
            }
        })

        const result = await network.run(event.data.value);

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
                    content: result.state.data.summary,
                    role: "ASSISTANT",
                    type: "RESULT",
                    fragment:{
                        create: {
                            sandboxUrl: sandboxUrl,
                            title: "Fragment",
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