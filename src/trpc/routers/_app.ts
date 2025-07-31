import {z} from 'zod';
import {baseProcedure , createTRPCRouter} from '../init';

export const appRouter = createTRPCRouter({
    createAI: baseProcedure
        .input(z.object({text: z.string().nullish()}))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text ?? 'World'}`
            };
        }),
});

export type AppRouter = typeof appRouter;