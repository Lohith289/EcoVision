'use server';

/**
 * @fileOverview Classifies a piece of waste from an image.
 *
 * - classifyWaste - A function that classifies waste from an image data URI.
 * - ClassifyWasteInput - The input type for the classifyWaste function.
 * - ClassifyWasteOutput - The return type for the classifyWaste function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClassifyWasteInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of the waste item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyWasteInput = z.infer<typeof ClassifyWasteInputSchema>;

const ClassifyWasteOutputSchema = z.object({
  itemName: z.string().describe('The specific name of the waste item (e.g., "Plastic bottle", "Apple core").'),
  category: z
    .enum(["Biodegradable", "Recyclable", "Domestic Hazardous"])
    .describe("The classification category of the waste item."),
  recyclingTips: z.string().optional().describe("A few ideas on how to recycle or biodegrade the waste item yourself. Only provide for 'Recyclable' and 'Biodegradable' items."),
});
export type ClassifyWasteOutput = z.infer<typeof ClassifyWasteOutputSchema>;

export async function classifyWaste(
  imageDataUri: string
): Promise<ClassifyWasteOutput> {
  return classifyWasteFlow({ imageDataUri });
}

const prompt = ai.definePrompt({
  name: 'classifyWastePrompt',
  input: { schema: ClassifyWasteInputSchema },
  output: { schema: ClassifyWasteOutputSchema },
  prompt: `You are an expert in waste classification. Analyze the provided image and identify the primary waste item.
  
  Determine the specific item name and its category from the following options: Biodegradable, Recyclable, or Domestic Hazardous.
  
  - Biodegradable (Green Bin) examples: Vegetable peels, leftover food, meat/bones, garden leaves, tea bags, coconut shells.
  - Recyclable (Blue Bin) examples: Plastic bottles, paper, cardboard, metal tins, glass, rubber, thermocol.
  - Domestic Hazardous (Red Bin) examples: Paint cans, insecticide spray, used batteries, tube lights, expired medicines, broken thermometers.

  If the item is 'Recyclable' or 'Biodegradable', provide a few creative and practical ideas for how someone could recycle or biodegrade the item themselves at home.
  Do not provide tips for 'Domestic Hazardous' waste.
  
  Image: {{media url=imageDataUri}}`,
});

const classifyWasteFlow = ai.defineFlow(
  {
    name: 'classifyWasteFlow',
    inputSchema: ClassifyWasteInputSchema,
    outputSchema: ClassifyWasteOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
