'use server';

/**
 * @fileOverview Summarizes the user's waste classification history.
 *
 * - summarizeClassificationHistory - A function that generates a summary of the user's classification history.
 * - SummarizeClassificationHistoryInput - The input type for the summarizeClassificationHistory function (currently empty).
 * - SummarizeClassificationHistoryOutput - The return type for the summarizeClassificationHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClassificationHistoryInputSchema = z.object({
  wasteClassificationHistory: z
    .array(z.string())
    .describe('An array of waste classifications (e.g., ["Plastic", "Paper"])'),
});
export type SummarizeClassificationHistoryInput = z.infer<typeof SummarizeClassificationHistoryInputSchema>;

const SummarizeClassificationHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the waste classification history.'),
});
export type SummarizeClassificationHistoryOutput = z.infer<typeof SummarizeClassificationHistoryOutputSchema>;

export async function summarizeClassificationHistory(
  wasteClassificationHistory: string[]
): Promise<SummarizeClassificationHistoryOutput> {
  return summarizeClassificationHistoryFlow({wasteClassificationHistory});
}

const prompt = ai.definePrompt({
  name: 'summarizeClassificationHistoryPrompt',
  input: {
    schema: SummarizeClassificationHistoryInputSchema,
  },
  output: {
    schema: SummarizeClassificationHistoryOutputSchema,
  },
  prompt: `You are an expert in waste management and recycling.
Based on the following list of classified waste items, provide a short, encouraging summary for the user.
Highlight their most common classification and offer a simple tip for that category.

History:
{{#each wasteClassificationHistory}}
- {{this}}
{{/each}}
`,
});

const summarizeClassificationHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeClassificationHistoryFlow',
    inputSchema: SummarizeClassificationHistoryInputSchema,
    outputSchema: SummarizeClassificationHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
