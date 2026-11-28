import type { Task } from './activity-model';

export type Repeat = 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type TaskSource = 'gmail' | 'outlook' | 'google-meet' | 'teams';
export const repeats: { value: Repeat; label: string }[] = [
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekdays', label: 'Dias úteis' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensalmente' },
];
export const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function dayKey(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('-');
}

export function dateAtNoon(key: string) {
  return new Date(key + 'T12:00:00');
}

export function validDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && dayKey(dateAtNoon(value)) === value;
}

export function shiftDay(key: string, days: number) {
  const date = dateAtNoon(key);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

function dayDistance(first: string, second: string) {
  return Math.round((Date.parse(second) - Date.parse(first)) / 86400000);
}

function nextOccurrence(task: Task, scheduled: string) {
  const date = dateAtNoon(scheduled);
  if (task.repeat === 'monthly') {
    const anchor = task.monthDay ?? date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + (task.repeatInterval ?? 1));
    const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(anchor, last));
    return dayKey(date);
  }
  const days = task.repeat === 'weekdays' ? [1, 2, 3, 4, 5] : task.repeatDays;
  if (task.repeat === 'daily') return shiftDay(scheduled, 1);
  if (!days?.length) return shiftDay(scheduled, 7);
  do { date.setDate(date.getDate() + 1); } while (!days.includes(date.getDay()));
  return dayKey(date);
}

export function finishTask(tasks: Task[], id: number, done: boolean, skip = false) {
  const task = tasks.find(item => item.id === id);
  if (!task || task.done === done) return tasks;
  if (!done && tasks.some(item => item.previousOccurrence === id)) return tasks;
  const updated = tasks.map(item => item.id === id ? { ...item, done, priority: done ? false : item.priority, skipped: skip || undefined } : item);
  if (!done || !task.repeat || !task.plannedDate || tasks.some(item => item.previousOccurrence === id)) return updated;
  const scheduled = task.recurrenceDate ?? task.plannedDate;
  const due = task.recurrenceDate ? task.recurrenceDueDate : task.dueDate;
  const date = nextOccurrence(task, scheduled);
  return [...updated, {
    ...task, id: Math.max(...tasks.map(item => item.id)) + 1, previousOccurrence: id, plannedDate: date,
    dueDate: due ? shiftDay(date, dayDistance(scheduled, due)) : undefined,
    recurrenceDate: undefined, recurrenceDueDate: undefined,
    monthDay: task.repeat === 'monthly' ? task.monthDay ?? dateAtNoon(scheduled).getDate() : undefined,
    reminderAt: task.reminderAt ? shiftDay(task.reminderAt.slice(0,10),dayDistance(scheduled,date))+task.reminderAt.slice(10) : undefined,
    reminderDelivered: undefined,
    done: false, priority: false, skipped: undefined,
    checklist: task.checklist?.map(step => ({ ...step, done: false })),
  }];
}

export function httpsLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
