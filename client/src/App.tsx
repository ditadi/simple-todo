
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());

  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsLoading(true);
    try {
      const todoData: CreateTodoInput = { title: newTodoTitle.trim() };
      const newTodo = await trpc.createTodo.mutate(todoData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async (id: number) => {
    setCompletingIds((prev: Set<number>) => new Set(prev).add(id));
    try {
      const updatedTodo = await trpc.markTodoCompleted.mutate({ id });
      setTodos((prev: Todo[]) => 
        prev.map((todo: Todo) => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Failed to mark todo as completed:', error);
    } finally {
      setCompletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const incompleteTodos = todos.filter((todo: Todo) => !todo.completed);
  const completedTodos = todos.filter((todo: Todo) => todo.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">To-Do</h1>
          <p className="text-gray-500">Keep it simple</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleAddTodo} className="flex gap-3">
              <Input
                value={newTodoTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewTodoTitle(e.target.value)
                }
                placeholder="Add a new task..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !newTodoTitle.trim()}>
                {isLoading ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {incompleteTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">Tasks</h2>
              <div className="space-y-2">
                {incompleteTodos.map((todo: Todo) => (
                  <Card key={todo.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{todo.title}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkCompleted(todo.id)}
                          disabled={completingIds.has(todo.id)}
                        >
                          {completingIds.has(todo.id) ? 'Completing...' : 'Complete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-500 mb-3">Completed</h2>
              <div className="space-y-2">
                {completedTodos.map((todo: Todo) => (
                  <Card key={todo.id} className="border-l-4 border-l-green-500 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <span className="text-gray-500 line-through">{todo.title}</span>
                        <span className="ml-auto text-green-600">✓</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks yet. Add one above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
