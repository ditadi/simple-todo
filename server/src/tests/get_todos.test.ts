
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it('should return all todos ordered by created_at desc', async () => {
    // Create test todos with different timestamps
    const todo1 = await db.insert(todosTable)
      .values({
        title: 'First Todo',
        description: 'First description'
      })
      .returning()
      .execute();

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const todo2 = await db.insert(todosTable)
      .values({
        title: 'Second Todo',
        description: 'Second description'
      })
      .returning()
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    // Should be ordered by created_at desc (newest first)
    expect(result[0].title).toEqual('Second Todo');
    expect(result[1].title).toEqual('First Todo');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle todos with null descriptions', async () => {
    await db.insert(todosTable)
      .values({
        title: 'Todo without description',
        description: null
      })
      .returning()
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Todo without description');
    expect(result[0].description).toBeNull();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return todos with all required fields', async () => {
    await db.insert(todosTable)
      .values({
        title: 'Complete Todo',
        description: 'A complete todo item'
      })
      .returning()
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    const todo = result[0];
    expect(todo.id).toBeDefined();
    expect(typeof todo.id).toBe('number');
    expect(todo.title).toEqual('Complete Todo');
    expect(todo.description).toEqual('A complete todo item');
    expect(todo.created_at).toBeInstanceOf(Date);
  });
});
