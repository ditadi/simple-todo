
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type Todo } from '../schema';

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  try {
    // Insert todo record
    const result = await db.insert(todosTable)
      .values({
        title: input.title,
        description: input.description || null
      })
      .returning()
      .execute();

    const todo = result[0];
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      created_at: todo.created_at
    };
  } catch (error) {
    console.error('Todo creation failed:', error);
    throw error;
  }
};
