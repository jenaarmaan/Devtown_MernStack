"use client";

import type { Task } from "@/types";
import TaskItem from "./TaskItem";
import { Card } from "@/components/ui/card";

type TaskListProps = {
  tasks: Task[];
  title: string;
  emptyMessage: string;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
};

export default function TaskList({ tasks, title, emptyMessage, onToggleComplete, onDelete, onEdit }: TaskListProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold font-headline mb-4">{title}</h2>
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <Card className="text-muted-foreground text-center p-8">
          {emptyMessage}
        </Card>
      )}
    </section>
  );
}
