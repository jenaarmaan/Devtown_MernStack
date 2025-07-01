"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

type TaskFormProps = {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    taskInput: string;
    setTaskInput: (value: string) => void;
    editingTask: Task | null;
    onCancelEdit: () => void;
};

export default function TaskForm({ onSubmit, taskInput, setTaskInput, editingTask, onCancelEdit }: TaskFormProps) {
    return (
        <Card className="mb-8 shadow-lg">
            <CardHeader>
                <CardTitle>
                    {editingTask ? "Edit Task" : "Add a new task"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        placeholder="What do you need to do?"
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        className="flex-grow"
                    />
                    <div className="flex gap-2 justify-end">
                        <Button type="submit" disabled={!taskInput.trim()}>
                            {editingTask ? (
                                "Update Task"
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" /> Add Task
                                </>
                            )}
                        </Button>
                        {editingTask && (
                            <Button variant="outline" onClick={onCancelEdit}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
