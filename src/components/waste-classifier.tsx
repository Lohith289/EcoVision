"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useClassification } from "@/contexts/classification-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Loader2, Leaf, Recycle, Biohazard, CameraOff, Sparkles, AlertCircle } from "lucide-react";
import type { ClassificationResult, WasteCategory } from "@/types";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { classifyWaste } from "@/ai/flows/classify-waste";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const categoryInfo: Record<
  WasteCategory,
  { icon: React.ReactNode; description: string; examples: string, color: string; progressClass: string }
> = {
  Biodegradable: {
    icon: <Leaf className="h-8 w-8 text-primary" />,
    description: "This is biodegradable waste. Please dump it in the GREEN bin.",
    examples: "e.g., Vegetable peels, leftover food, garden leaves, tea bags.",
    color: "primary",
    progressClass: "bg-primary",
  },
  Recyclable: {
    icon: <Recycle className="h-8 w-8 text-blue-500" />,
    description: "This is recyclable waste. Please dump it in the BLUE bin.",
    examples: "e.g., Plastic bottles, paper, cardboard, metal tins, glass.",
    color: "blue-500",
    progressClass: "bg-blue-500",
  },
  "Domestic Hazardous": {
    icon: <Biohazard className="h-8 w-8 text-destructive" />,
    description: "This is domestic hazardous waste. Please dump it in the RED bin.",
    examples: "e.g., Paint cans, used batteries, expired medicines, broken thermometers.",
    color: "destructive",
    progressClass: "bg-destructive",
  },
};

export function WasteClassifier() {
  const { addClassification } = useClassification();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<Omit<ClassificationResult, 'id' | 'timestamp'> | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      stopCamera();
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setHasCameraPermission(false);
      setIsCameraOn(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn, startCamera, stopCamera]);

  const handleScan = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    setIsScanning(true);
    setLastResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        setIsScanning(false);
        return;
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await classifyWaste(imageDataUri);
      addClassification(result);
      setLastResult(result);
    } catch (e) {
      console.error(e);
      toast({
        title: "Classification Failed",
        description: "Could not identify the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), 3000);
    }
  };

  const getResultCardClasses = (category: WasteCategory | null) => {
    if (!category) return "bg-card border";
    switch (category) {
      case "Biodegradable":
        return "bg-primary/10 border-primary/20";
      case "Recyclable":
        return "bg-blue-500/10 border-blue-500/20";
      case "Domestic Hazardous":
        return "bg-destructive/10 border-destructive/20";
      default:
        return "bg-card border";
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl md:text-4xl">
          EcoVision
        </CardTitle>
        <CardDescription>
            Point your camera at a piece of waste and scan it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 p-4 md:p-6">
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border shadow-inner">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isCameraOn && hasCameraPermission ? "opacity-100" : "opacity-0"
            }`}
          />
          {(!isCameraOn || hasCameraPermission === false) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
              {hasCameraPermission === false ? (
                 <Alert variant="destructive" className="max-w-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                      Please grant camera permissions in your browser settings to use this feature.
                    </AlertDescription>
                  </Alert>
              ) : (
                <>
                  <CameraOff className="h-8 w-8 mb-4" />
                  <p>Camera is off</p>
                </>
              )}
            </div>
          )}
          {isCameraOn && hasCameraPermission === null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Starting camera...</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
            <Switch id="camera-toggle" checked={isCameraOn} onCheckedChange={setIsCameraOn} />
            <Label htmlFor="camera-toggle">Camera On</Label>
        </div>
        
        <Button
          onClick={handleScan}
          disabled={isScanning || !isCameraOn || !hasCameraPermission || isCooldown}
          className="w-full max-w-xs transition-all duration-300"
          size="lg"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : isCooldown ? (
            "Ready to scan again"
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Scan Item
            </>
          )}
        </Button>

        {lastResult && (
          <div className={`text-center p-4 rounded-lg w-full border animate-in fade-in-50 slide-in-from-bottom-5 ${getResultCardClasses(lastResult.category)}`}>
            <div className="flex justify-center mb-2">
              {categoryInfo[lastResult.category].icon}
            </div>
            <h3 className="text-xl font-bold">Detected: {lastResult.itemName}</h3>
            <p className="font-semibold text-base mb-1">Category: {lastResult.category}</p>
            <p className="text-muted-foreground">
              {categoryInfo[lastResult.category].description}
            </p>
             <p className="text-xs text-muted-foreground mt-2">
              {categoryInfo[lastResult.category].examples}
            </p>
            {lastResult.recyclingTips && (
              <div className="mt-4 text-left p-3 bg-background/50 rounded-md">
                 <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 justify-center"><Sparkles className="w-4 h-4 text-accent"/> DIY Ideas</h4>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lastResult.recyclingTips}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
