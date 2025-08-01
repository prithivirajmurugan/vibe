
import {createTRPCRouter} from '../init';
import { messagesRouter } from '@/modules/messages/server/procedure';

export const appRouter = createTRPCRouter({
    messages: messagesRouter,

});

export type AppRouter = typeof appRouter;