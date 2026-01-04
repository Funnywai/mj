'use server';

/**
 * @fileOverview Provides suggestions for calculations based on user input values.
 *
 * - suggestCalculations - A function that suggests calculations.
 * - SuggestCalculationsInput - The input type for suggestCalculations.
 * - SuggestCalculationsOutput - The return type for suggestCalculations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCalculationsInputSchema = z.object({
  userInputs: z.array(
    z.array(z.number()).length(6).describe('Six numerical input values for one output row.')
  ).describe('Input values from a variable number of output rows, each containing 6 numbers.'),
});

export type SuggestCalculationsInput = z.infer<typeof SuggestCalculationsInputSchema>;

const SuggestCalculationsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggested calculation formula or insight.')
  ).describe('A list of suggested calculations based on the input values.'),
});

export type SuggestCalculationsOutput = z.infer<typeof SuggestCalculationsOutputSchema>;

export async function suggestCalculations(input: SuggestCalculationsInput): Promise<SuggestCalculationsOutput> {
  return suggestCalculationsFlow(input);
}

const suggestCalculationsPrompt = ai.definePrompt({
  name: 'suggestCalculationsPrompt',
  input: {schema: SuggestCalculationsInputSchema},
  output: {schema: SuggestCalculationsOutputSchema},
  prompt: `Given the input values from users, suggest some interesting calculations or formulas that could be applied to these numbers to gain insights. Each user input set contains 6 numbers.

User Input Values:
{{#each userInputs}}
  Row {{@index}}: {{this}}
{{/each}}

Based on the provided rows of 6 numbers, provide 3-5 insightful and varied calculation suggestions. The suggestions should be creative and explore relationships within and between the numbers.`,
});

const suggestCalculationsFlow = ai.defineFlow(
  {
    name: 'suggestCalculationsFlow',
    inputSchema: SuggestCalculationsInputSchema,
    outputSchema: SuggestCalculationsOutputSchema,
  },
  async input => {
    const {output} = await suggestCalculationsPrompt(input);
    return output!;
  }
);
