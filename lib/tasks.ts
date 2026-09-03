import type { Task } from "./types";
import { newId } from "./storage";

const TASKS_KEY = "jarvis:tasks";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage unavailable - task list stays in memory for this session only.
  }
}

export function createTask(text: string, dueLabel: string | null = null): Task {
  return {
    id: newId(),
    text,
    done: false,
    dueLabel,
    createdAt: Date.now(),
  };
}
