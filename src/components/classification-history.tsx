"use client";

import { useClassification } from "@/contexts/classification-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Leaf, FileText, Recycle, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { WasteCategory } from "@/types";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { summarizeClassificationHistory } from "@/ai/flows/summarize-classification-history";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: Record<WasteCategory, React.ReactElement> = {
  Plastic: <Recycle />,
  Paper: <FileText />,
  Organic: <Leaf />,
};

export function ClassificationHistory() {
  const { history, clearHistory } = useClassification();
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (history.length < 3) {
      toast({
        title: "Not enough data",
        description: "Scan at least 3 items to get a summary.",
        variant: "destructive",
      });
      return;
    }
    setIsSummarizing(true);
    setSummary(null);
    try {
      const historyStrings = history.map((item) => item.category);
      const result = await summarizeClassificationHistory(historyStrings.reverse());
      setSummary(result.summary);
    } catch (e) {
      console.error(e);
      setSummary("Could not generate summary at this time.");
      toast({
        title: "Error",
        description: "Failed to generate AI summary.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };


  return (
    <>
      <SidebarHeader>
        <h2 className="text-xl font-headline font-semibold">Scan History</h2>
        <p className="text-sm text-muted-foreground">
          Your recently scanned items.
        </p>
      </SidebarHeader>

      {history.length > 0 && (
        <div className="px-4 pb-2">
            <Button variant="outline" className="w-full" onClick={handleSummarize} disabled={isSummarizing}>
                {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get AI Summary
            </Button>
            {summary && <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md border">{summary}</p>}
        </div>
      )}
      <Separator />

      <SidebarContent>
        <ScrollArea className="h-full">
          {history.length > 0 ? (
            <div className="p-4 space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-muted border">
                    {React.cloneElement(categoryIcons[item.category], {
                      className: "h-5 w-5 text-muted-foreground",
                    })}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-muted-foreground">No items scanned yet.</p>
              <p className="text-sm text-muted-foreground">
                Start scanning to see your history here.
              </p>
            </div>
          )}
        </ScrollArea>
      </SidebarContent>

      {history.length > 0 && (
        <>
          <Separator />
          <SidebarFooter>
            <Button variant="ghost" className="w-full" onClick={clearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          </SidebarFooter>
        </>
      )}
    </>
  );
}
