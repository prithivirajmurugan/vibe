import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";



export const messagesRouter = createTRPCRouter({
    getMany: baseProcedure.query(async () => {
        return await prisma.message.findMany({
            orderBy: {
                updatedAt: "desc"
            }
        });
    }),
    create: baseProcedure.input(
        z.object({
            value: z.string().describe("The value of the message"),
        })
    ).mutation(async ({ input }) => {
        const createdMessage = await prisma.message.create({
            data: {
                content: input.value,
                role: "USER",
                type: "RESULT"
            }
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
                value: input.value
            }
        })

        return createdMessage

    })
})