
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type MarkTodoCompletedInput } from '../schema';
import { markTodoCompleted } from '../handlers/mark_todo_completed';
import { eq } from 'drizzle-orm';

describe('markTodoCompleted', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark a todo as completed', async () => {
    // Create a test todo first
    const createResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const testTodo = createResult[0];
    expect(testTodo.completed).toBe(false);

    // Mark it as completed
    const input: MarkTodoCompletedInput = {
      id: testTodo.id
    };

    const result = await markTodoCompleted(input);

    // Verify the result
    expect(result.id).toEqual(testTodo.id);
    expect(result.title).toEqual('Test Todo');
    expect(result.completed).toBe(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save completed status to database', async () => {
    // Create a test todo first
    const createResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const testTodo = createResult[0];

    // Mark it as completed
    const input: MarkTodoCompletedInput = {
      id: testTodo.id
    };

    await markTodoCompleted(input);

    // Verify in database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toBe(true);
    expect(todos[0].title).toEqual('Test Todo');
  });

  it('should throw error when todo not found', async () => {
    const input: MarkTodoCompletedInput = {
      id: 999999 // Non-existent ID
    };

    await expect(markTodoCompleted(input)).rejects.toThrow(/Todo with id 999999 not found/i);
  });

  it('should work with already completed todo', async () => {
    // Create a test todo that's already completed
    const createResult = await db.insert(todosTable)
      .values({
        title: 'Already Completed Todo',
        completed: true
      })
      .returning()
      .execute();

    const testTodo = createResult[0];

    // Mark it as completed again
    const input: MarkTodoCompletedInput = {
      id: testTodo.id
    };

    const result = await markTodoCompleted(input);

    // Verify it's still completed
    expect(result.completed).toBe(true);
    expect(result.title).toEqual('Already Completed Todo');
  });
});
