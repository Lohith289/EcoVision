"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useClassification } from "@/contexts/classification-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Loader2, Leaf, Recycle, Biohazard, CameraOff } from "lucide-react";
import type { WasteCategory } from "@/types";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const categories: WasteCategory[] = ["Biodegradable", "Recyclable", "Domestic Hazardous"];

const categoryInfo: Record<
  WasteCategory,
  { icon: React.ReactNode; description: string; examples: string }
> = {
  Biodegradable: {
    icon: <Leaf className="h-8 w-8 text-green-500" />,
    description: "This is biodegradable waste. Please dump it in the GREEN bin.",
    examples: "e.g., Vegetable peels, leftover food, garden leaves, tea bags."
  },
  Recyclable: {
    icon: <Recycle className="h-8 w-8 text-blue-500" />,
    description: "This is recyclable waste. Please dump it in the BLUE bin.",
    examples: "e.g., Plastic bottles, paper, cardboard, metal tins, glass."
  },
  "Domestic Hazardous": {
    icon: <Biohazard className="h-8 w-8 text-red-500" />,
    description: "This is domestic hazardous waste. Please dump it in the RED bin.",
    examples: "e.g., Paint cans, used batteries, expired medicines, broken thermometers."
  },
};

export function WasteClassifier() {
  const { addClassification } = useClassification();
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<WasteCategory | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraReady(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      stopCamera();
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError(
          "Could not access the camera. Please check permissions and try again."
        );
        setIsCameraReady(false);
      }
    } else {
      setError("Your browser does not support camera access.");
      setIsCameraReady(false);
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

  const handleScan = () => {
    setIsScanning(true);
    setLastResult(null);

    // Mock classification since we cannot install tensorflow.js
    setTimeout(() => {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      addClassification(randomCategory);
      setLastResult(randomCategory);
      setIsScanning(false);
    }, 2000);
  };

  const getResultCardClasses = (category: WasteCategory | null) => {
    if (!category) return "bg-primary/10 border-primary/20";
    switch (category) {
      case "Biodegradable":
        return "bg-green-500/10 border-green-500/20";
      case "Recyclable":
        return "bg-blue-500/10 border-blue-500/20";
      case "Domestic Hazardous":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-primary/10 border-primary/20";
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
              isCameraReady && isCameraOn ? "opacity-100" : "opacity-0"
            }`}
          />
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <CameraOff className="h-8 w-8 mb-4" />
                <p>Camera is off</p>
            </div>
          )}
          {isCameraOn && !isCameraReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Starting camera...</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4">
              <Camera className="h-8 w-8 mb-4" />
              <p className="text-center font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
            <Switch id="camera-toggle" checked={isCameraOn} onCheckedChange={setIsCameraOn} />
            <Label htmlFor="camera-toggle">Camera On</Label>
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning || !isCameraReady || !isCameraOn}
          className="w-full max-w-xs transition-all duration-300"
          size="lg"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Scan Item
            </>
          )}
        </Button>

        {lastResult && (
          <div className={`text-center p-4 rounded-lg w-full border animate-in fade-in-50 slide-in-from-bottom-5 ${getResultCardClasses(lastResult)}`}>
            <div className="flex justify-center mb-2">
              {categoryInfo[lastResult].icon}
            </div>
            <h3 className="text-xl font-bold">Detected: {lastResult}</h3>
            <p className="text-muted-foreground">
              {categoryInfo[lastResult].description}
            </p>
             <p className="text-xs text-muted-foreground mt-2">
              {categoryInfo[lastResult].examples}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
