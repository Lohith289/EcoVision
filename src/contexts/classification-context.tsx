"use client";

import type { ClassificationResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

interface AddClassificationData {
  itemName: string;
  category: ClassificationResult['category'];
}

interface ClassificationContextType {
  history: ClassificationResult[];
  addClassification: (data: AddClassificationData) => void;
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
    (data: AddClassificationData) => {
      const newItem: ClassificationResult = {
        id: crypto.randomUUID(),
        itemName: data.itemName,
        category: data.category,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev]);
      toast({
        title: "Item Classified!",
        description: `${data.itemName} is ${data.category}.`,
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
