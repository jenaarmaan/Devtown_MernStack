"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types";
import { prioritizeTasks } from "@/ai/flows/prioritize-tasks";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

export default function TaskFlowApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    if (editingTask) {
      setTaskInput(editingTask.description);
      const input = document.querySelector('input[type="text"]') as HTMLInputElement | null;
      input?.focus();
      input?.select();
    } else {
      setTaskInput("");
    }
  }, [editingTask]);
  
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, description: taskInput.trim() }
            : task
        )
      );
      setEditingTask(null);
      toast({ title: "Task updated successfully!" });
    } else {
      const newTask: Task = {
        id: new Date().toISOString(),
        description: taskInput.trim(),
        isCompleted: false,
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task added successfully!" });
    }
    setTaskInput("");
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
      title: "Task deleted.",
      variant: "destructive",
    });
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  }

  const handleCancelEdit = () => {
    setEditingTask(null);
  }


  const handlePrioritizeTasks = async () => {
    const incompleteTasks = tasks.filter((task) => !task.isCompleted);
    if (incompleteTasks.length === 0) {
      toast({
        title: "No incomplete tasks to prioritize.",
        description: "Add some new tasks or mark some as incomplete.",
      });
      return;
    }

    setIsPrioritizing(true);
    try {
      const tasksForAI = incompleteTasks.map(
        ({ id, description, isCompleted }) => ({
          id,
          description,
          isCompleted,
        })
      );

      const userHabits =
        "User is a busy professional who wants to optimize their workflow. They tend to complete urgent tasks first and sometimes procrastinates on less important ones.";

      const prioritizedList = await prioritizeTasks({
        tasks: tasksForAI,
        userHabits,
      });

      const newTasks = tasks.map((task) => {
        const prioritized = prioritizedList.find((p) => p.id === task.id);
        if (prioritized) {
          return {
            ...task,
            priority: prioritized.priority,
            reason: prioritized.reason,
          };
        }
        return { ...task, priority: undefined, reason: undefined };
      });
      setTasks(newTasks);
      toast({
        title: "Tasks prioritized by AI!",
        description: "Your to-do list has been reordered.",
      });
    } catch (error) {
      console.error("Failed to prioritize tasks:", error);
      toast({
        title: "AI Prioritization Failed",
        description: "Could not prioritize tasks. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsPrioritizing(false);
    }
  };

  const incompleteTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.isCompleted)
        .sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity)),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.isCompleted),
    [tasks]
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground font-body">
        <main className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
              TaskFlow
            </h1>
            <p className="text-muted-foreground mt-2">
              Your intelligent to-do list, powered by AI
            </p>
          </header>

          <TaskForm 
            onSubmit={handleSubmit}
            taskInput={taskInput}
            setTaskInput={setTaskInput}
            editingTask={editingTask}
            onCancelEdit={handleCancelEdit}
          />

          <div className="mb-8 flex justify-center">
            <Button
              onClick={handlePrioritizeTasks}
              disabled={
                isPrioritizing ||
                tasks.filter((t) => !t.isCompleted).length === 0
              }
            >
              {isPrioritizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prioritizing...
                </>
              ) : (
                "Prioritize with AI"
              )}
            </Button>
          </div>

          <div className="space-y-8">
            <TaskList
              tasks={incompleteTasks}
              title="To-Do"
              emptyMessage="You're all caught up!"
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />

            {completedTasks.length > 0 && (
              <TaskList
                tasks={completedTasks}
                title="Completed"
                emptyMessage=""
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
