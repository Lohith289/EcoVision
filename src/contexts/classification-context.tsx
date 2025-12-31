"use client";

import type { ClassificationResult, WasteCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

interface ClassificationContextType {
  history: ClassificationResult[];
  addClassification: (category: WasteCategory) => void;
  clearHistory: () => void;
}

const ClassificationContext = createContext<ClassificationContextType | undefined>(
  undefined
);

export function ClassificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<ClassificationResult[]>([]);
  const { toast } = useToast();

  const addClassification = useCallback(
    (category: WasteCategory) => {
      const newItem: ClassificationResult = {
        id: crypto.randomUUID(),
        category,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev]);
      toast({
        title: "Item Classified!",
        description: `Detected as: ${category}`,
      });
    },
    [toast]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    toast({
      title: "History Cleared",
    });
  }, [toast]);

  return (
    <ClassificationContext.Provider
      value={{ history, addClassification, clearHistory }}
    >
      {children}
    </ClassificationContext.Provider>
  );
}

export function useClassification() {
  const context = useContext(ClassificationContext);
  if (!context) {
    throw new Error(
      "useClassification must be used within a ClassificationProvider"
    );
  }
  return context;
}
