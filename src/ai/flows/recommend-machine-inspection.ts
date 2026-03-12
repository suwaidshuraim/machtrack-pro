'use server';
/**
 * @fileOverview This file implements a Genkit flow that analyzes machine usage and maintenance history
 * to recommend the next inspection and assess its current condition.
 *
 * - recommendMachineInspection - A function that handles the machine inspection recommendation process.
 * - MachineInspectionInput - The input type for the recommendMachineInspection function.
 * - MachineInspectionOutput - The return type for the recommendMachineInspection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MachineInspectionInputSchema = z.object({
  machineId: z.string().describe('The unique identifier for the machine.'),
  usageHistory:
    z.string().describe('A summary of the machine\u0027s usage history, e.g., "Daily operation, 8 hours per day for the last 6 months. High load on Mondays."'),
  lastMaintenanceDate:
    z.string().describe('The date of the last maintenance performed on the machine in YYYY-MM-DD format.'),
  lastInspectionDate:
    z.string().describe('The date of the last inspection performed on the machine in YYYY-MM-DD format.'),
});
export type MachineInspectionInput = z.infer<typeof MachineInspectionInputSchema>;

const MachineInspectionOutputSchema = z.object({
  conditionSummary:
    z.string().describe('A concise summary of the machine\u0027s current condition based on its history.'),
  inspectionRecommendation:
    z.string().describe('A proactive recommendation for the next inspection date or timeframe (e.g., "within 2 weeks", "next month").'),
  justification:
    z.string().describe('A brief justification for the inspection recommendation, considering usage and maintenance history.'),
  needsInspection:
    z.boolean().describe('True if the machine needs an inspection soon based on the provided data, false otherwise.'),
});
export type MachineInspectionOutput = z.infer<typeof MachineInspectionOutputSchema>;

export async function recommendMachineInspection(
  input: MachineInspectionInput
): Promise<MachineInspectionOutput> {
  return recommendMachineInspectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendMachineInspectionPrompt',
  input: {schema: MachineInspectionInputSchema},
  output: {schema: MachineInspectionOutputSchema},
  prompt: `You are an expert maintenance planner for a manufacturing company. Your goal is to analyze machine data and provide proactive inspection recommendations.\n\nAnalyze the following information for machine ID: {{{machineId}}}.\n\nUsage History: {{{usageHistory}}}\nLast Maintenance Date: {{{lastMaintenanceDate}}}\nLast Inspection Date: {{{lastInspectionDate}}}\n\nBased on this data, provide:\n1. A concise summary of the machine's current condition.\n2. A proactive recommendation for its next inspection, including a date or timeframe.\n3. A brief justification for your recommendation.\n4. Determine if the machine needs an inspection soon (true/false) considering the usage and time since last inspection. Assume a machine under daily heavy use generally requires inspection every 3-6 months.\n\nEnsure your response is in the specified JSON format.`,
});

const recommendMachineInspectionFlow = ai.defineFlow(
  {
    name: 'recommendMachineInspectionFlow',
    inputSchema: MachineInspectionInputSchema,
    outputSchema: MachineInspectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
