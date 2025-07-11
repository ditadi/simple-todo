
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

  it('should return all todos ordered by creation date descending', async () => {
    // Create test todos with different timestamps
    const firstTodo = await db.insert(todosTable)
      .values({
        title: 'First Todo',
        completed: false
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondTodo = await db.insert(todosTable)
      .values({
        title: 'Second Todo',
        completed: true
      })
      .returning()
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    
    // Should be ordered by creation date descending (newest first)
    expect(result[0].title).toEqual('Second Todo');
    expect(result[0].completed).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    expect(result[1].title).toEqual('First Todo');
    expect(result[1].completed).toBe(false);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    
    // Verify order by timestamps
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return todos with correct field types', async () => {
    await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        completed: false
      })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('number');
    expect(typeof result[0].title).toBe('string');
    expect(typeof result[0].completed).toBe('boolean');
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});
