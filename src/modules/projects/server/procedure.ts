import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { generateSlug }  from 'random-word-slugs'; // Assuming you have a utility function to generate slugs
import { TRPCError } from "@trpc/server";



export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure.input(
        z.object({
            id: z.string().describe("The ID of the project to retrieve")
        })
    ).query(async ({ input }) => {
        const project = await prisma.project.findUnique({
            where: {
                id: input.id
            }})
        if (!project) {
            throw new TRPCError({code:"NOT_FOUND", message: "Project not found"});
        }
        return project;
    }),
    getMany: baseProcedure.query(async () => {
        const projects = await prisma.project.findMany({
            orderBy: {
                updatedAt: "desc"
            }
        });
        return projects
    }),
    create: baseProcedure.input(
        z.object({
            value: z.string().describe("The value of the message")
            .min(1).max(10000, { message: "Message is too long" })
            .describe("Project name"),
        })
    ).mutation(async ({ input }) => {
        const createdProject = await prisma.project.create({
            data: {
                name: generateSlug(2,{format: "kebab"}),
                messages: {
                    create:{
                content: input.value,
                role: "USER",
                type: "RESULT"
            } 
                }
                
            }
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.value,
                projectId: createdProject.id
            }
        })

        return createdProject

    })
})
