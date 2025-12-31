export type WasteCategory =
  | "Biodegradable"
  | "Recyclable"
  | "Domestic Hazardous";

export interface ClassificationResult {
  id: string;
  category: WasteCategory;
  timestamp: number;
}
