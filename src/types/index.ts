export type Task = {
  id: string;
  description: string;
  isCompleted: boolean;
  priority?: number;
  reason?: string;
};
