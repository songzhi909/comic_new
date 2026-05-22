import { randomUUID } from 'crypto';

interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

const tasks = new Map<string, Task>();

export function createTask(): string {
  const id = randomUUID();
  tasks.set(id, { id, status: 'pending', progress: 0 });
  return id;
}

export function updateTask(id: string, updates: Partial<Task>): void {
  const task = tasks.get(id);
  if (task) {
    Object.assign(task, updates);
  }
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}
