
import { z } from 'zod';

// Todo schema
export const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Todo = z.infer<typeof todoSchema>;

// Input schema for creating todos
export const createTodoInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional()
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;
