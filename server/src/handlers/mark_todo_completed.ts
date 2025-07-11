
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type MarkTodoCompletedInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const markTodoCompleted = async (input: MarkTodoCompletedInput): Promise<Todo> => {
  try {
    // Update the todo to mark it as completed
    const result = await db.update(todosTable)
      .set({
        completed: true
      })
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    // Check if todo was found and updated
    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Mark todo completed failed:', error);
    throw error;
  }
};
