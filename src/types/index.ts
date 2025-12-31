export type WasteCategory = "Plastic" | "Paper" | "Organic";

export interface ClassificationResult {
  id: string;
  category: WasteCategory;
  timestamp: number;
}
