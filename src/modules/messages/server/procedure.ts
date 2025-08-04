import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";



export const messagesRouter = createTRPCRouter({
    getMany: protectedProcedure.input(
        z.object({
            projectId: z.string().describe("The ID of the project to filter messages by")
        })
    ).query(async ( { input, ctx }) => {
        return await prisma.message.findMany({
         where:{
                projectId: input.projectId,
                project: {
                    userId: ctx.auth.userId
                }
            },
            include:{
                fragment:true
            },
            orderBy: {
                updatedAt: "desc"
            }
        });
    }),
    create: protectedProcedure.input(
        z.object({
            value: z.string().describe("The value of the message").min(1).max(10000, { message: "Message is too long" }),
            projectId: z.string().describe("The ID of the project to associate with the message"),
        })
    ).mutation(async ({ input, ctx }) => {
        const existingProject = await prisma.project.findUnique({
            where: {
                id: input.projectId,
                userId: ctx.auth.userId
            }
        });

        if (!existingProject) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
        const createdMessage = await prisma.message.create({
            data: {
                projectId: existingProject.id,
                content: input.value,
                role: "USER",
                type: "RESULT"
            }
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.value,
                projectId: input.projectId
            }
        })

        return createdMessage

    })
})