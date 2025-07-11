
import { z } from 'zod';

// Todo schema
export const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.coerce.date()
});

export type Todo = z.infer<typeof todoSchema>;

// Input schema for creating todos
export const createTodoInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long")
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

// Input schema for marking todo as completed
export const markTodoCompletedInputSchema = z.object({
  id: z.number()
});

export type MarkTodoCompletedInput = z.infer<typeof markTodoCompletedInputSchema>;
