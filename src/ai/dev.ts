'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/classify-waste.ts';
import '@/ai/flows/summarize-classification-history.ts';
