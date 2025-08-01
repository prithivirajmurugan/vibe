import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";



export const messagesRouter = createTRPCRouter({
    getMany: baseProcedure.input(
        z.object({
            projectId: z.string().describe("The ID of the project to filter messages by")
        })
    ).query(async ( { input }) => {
        return await prisma.message.findMany({
         where:{
                projectId: input.projectId
            },
            include:{
                fragment:true
            },
            orderBy: {
                updatedAt: "desc"
            }
        });
    }),
    create: baseProcedure.input(
        z.object({
            value: z.string().describe("The value of the message").min(1).max(10000, { message: "Message is too long" }),
            projectId: z.string().describe("The ID of the project to associate with the message"),
        })
    ).mutation(async ({ input }) => {
        const createdMessage = await prisma.message.create({
            data: {
                projectId: input.projectId,
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