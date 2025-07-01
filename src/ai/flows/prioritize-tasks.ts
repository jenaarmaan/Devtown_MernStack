'use server';

/**
 * @fileOverview An AI-powered task prioritization tool.
 *
 * - prioritizeTasks - A function that prioritizes tasks based on deadlines and user habits.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        deadline: z.string().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .describe('An array of tasks to prioritize.'),
  userHabits: z
    .string()
    .describe('A description of the user habits and task completion history.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(z.object({
  id: z.string(),
  priority: z.number().describe('The priority of the task, where 1 is the highest priority.'),
  reason: z.string().describe('The reason for the assigned priority.'),
}));
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI task prioritization expert. Given a list of tasks and a description of the user\'s habits,
you will prioritize the tasks based on their deadlines and the user\'s habits.

Tasks:
{{#each tasks}}
- ID: {{id}}
  Description: {{description}}
  Deadline: {{deadline}}
  Is Completed: {{isCompleted}}
{{/each}}

User Habits: {{userHabits}}

Prioritize the tasks and provide a reason for each task\'s priority. The tasks should be returned in an array with the task\'s ID, the priority, and a reason for the priority.
DO NOT INCLUDE ANY ADDITIONAL TEXT OR EXPLANATIONS OUTSIDE OF THE JSON OUTPUT.
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
); 
