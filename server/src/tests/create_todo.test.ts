
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  title: 'Test Todo',
  description: 'A todo for testing'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo with title and description', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Todo');
    expect(result.description).toEqual('A todo for testing');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a todo with only title (no description)', async () => {
    const inputWithoutDescription: CreateTodoInput = {
      title: 'Todo without description'
    };

    const result = await createTodo(inputWithoutDescription);

    expect(result.title).toEqual('Todo without description');
    expect(result.description).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a todo with null description when empty string provided', async () => {
    const inputWithEmptyDescription: CreateTodoInput = {
      title: 'Todo with empty description',
      description: ''
    };

    const result = await createTodo(inputWithEmptyDescription);

    expect(result.title).toEqual('Todo with empty description');
    expect(result.description).toBeNull(); // Empty string converts to null
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toEqual('Test Todo');
    expect(todos[0].description).toEqual('A todo for testing');
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple todos creation', async () => {
    const firstTodo = await createTodo({
      title: 'First Todo',
      description: 'First description'
    });

    const secondTodo = await createTodo({
      title: 'Second Todo',
      description: 'Second description'
    });

    // Verify both todos exist with different IDs
    expect(firstTodo.id).not.toEqual(secondTodo.id);
    expect(firstTodo.title).toEqual('First Todo');
    expect(secondTodo.title).toEqual('Second Todo');

    // Verify both are saved in database
    const allTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(allTodos).toHaveLength(2);
  });

  it('should create todos with current timestamp', async () => {
    const beforeCreation = new Date();
    const result = await createTodo(testInput);
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at >= beforeCreation).toBe(true);
    expect(result.created_at <= afterCreation).toBe(true);
  });
});
