'use server';

/**
 * @fileOverview Continuously classifies waste from an image stream.
 *
 * - continuouslyClassifyWaste - A function that returns probabilities for waste categories.
 * - ContinuousClassificationInput - The input type.
 * - ContinuousClassificationOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContinuousClassificationInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of the waste item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ContinuousClassificationInput = z.infer<typeof ContinuousClassificationInputSchema>;

const ContinuousClassificationOutputSchema = z.object({
  Biodegradable: z.number().min(0).max(1).describe('The probability of the item being Biodegradable.'),
  Recyclable: z.number().min(0).max(1).describe('The probability of the item being Recyclable.'),
  "Domestic Hazardous": z.number().min(0).max(1).describe('The probability of the item being Domestic Hazardous.'),
});
export type ContinuousClassificationOutput = z.infer<typeof ContinuousClassificationOutputSchema>;


export async function continuouslyClassifyWaste(
  imageDataUri: string
): Promise<ContinuousClassificationOutput> {
  return continuouslyClassifyWasteFlow({ imageDataUri });
}

const prompt = ai.definePrompt({
  name: 'continuouslyClassifyWastePrompt',
  input: { schema: ContinuousClassificationInputSchema },
  output: { schema: ContinuousClassificationOutputSchema },
  prompt: `You are an expert in waste classification. Analyze the provided image.
  
  Provide a probability score (between 0.0 and 1.0) for each of the following categories: Biodegradable, Recyclable, and Domestic Hazardous. The scores should sum to 1.0.
  
  - Biodegradable examples: Vegetable peels, leftover food, meat/bones, garden leaves, tea bags, coconut shells.
  - Recyclable examples: Plastic bottles, paper, cardboard, metal tins, glass, rubber, thermocol.
  - Domestic Hazardous examples: Paint cans, insecticide spray, used batteries, tube lights, expired medicines, broken thermometers.
  
  Image: {{media url=imageDataUri}}`,
});

const continuouslyClassifyWasteFlow = ai.defineFlow(
  {
    name: 'continuouslyClassifyWasteFlow',
    inputSchema: ContinuousClassificationInputSchema,
    outputSchema: ContinuousClassificationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
