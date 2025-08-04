
import { projectsRouter } from '@/modules/projects/server/procedure';
import {createTRPCRouter} from '../init';
import { messagesRouter } from '@/modules/messages/server/procedure';
import { usageRouter } from '@/modules/usage/procedure';

export const appRouter = createTRPCRouter({
    messages: messagesRouter,
    projects: projectsRouter,
    usage: usageRouter

});

export type AppRouter = typeof appRouter;