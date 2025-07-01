"use client";

import type { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Edit, Info } from "lucide-react";

type TaskItemProps = {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
};

export default function TaskItem({ task, onToggleComplete, onDelete, onEdit }: TaskItemProps) {
  return (
    <Card
      className={`flex items-center p-4 transition-all duration-300 ${
        task.isCompleted ? "bg-card border-dashed opacity-60" : "bg-card"
      }`}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.isCompleted}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mr-4"
        aria-label={`Mark "${task.description}" as ${
          task.isCompleted ? "incomplete" : "complete"
        }`}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={`flex-grow cursor-pointer ${
          task.isCompleted ? "line-through text-muted-foreground" : ""
        }`}
      >
        {task.description}
      </label>
      {task.priority && !task.isCompleted && (
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="secondary"
              className="mr-2 cursor-help flex items-center gap-1"
            >
              P{task.priority} <Info className="h-3 w-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-bold">AI Prioritization</p>
            <p>Reason: {task.reason}</p>
          </TooltipContent>
        </Tooltip>
      )}
      <div className="flex gap-1 ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          aria-label={`Edit task "${task.description}"`}
          disabled={task.isCompleted}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="text-destructive hover:text-destructive"
          aria-label={`Delete task "${task.description}"`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
