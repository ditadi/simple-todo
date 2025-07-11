
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { createTodoInputSchema, markTodoCompletedInputSchema } from './schema';
import { createTodo } from './handlers/create_todo';
import { getTodos } from './handlers/get_todos';
import { markTodoCompleted } from './handlers/mark_todo_completed';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  createTodo: publicProcedure
    .input(createTodoInputSchema)
    .mutation(({ input }) => createTodo(input)),
  getTodos: publicProcedure
    .query(() => getTodos()),
  markTodoCompleted: publicProcedure
    .input(markTodoCompletedInputSchema)
    .mutation(({ input }) => markTodoCompleted(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
