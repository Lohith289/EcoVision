import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-classification-history.ts';
import '@/ai/flows/classify-waste';
import '@/ai/flows/continuously-classify-waste';
