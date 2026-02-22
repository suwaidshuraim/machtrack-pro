
"use client"

import { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ScanLine } from "lucide-react"

interface CameraScannerProps {
  onScan: (id: string) => void;
}

export function CameraScanner({ onScan }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the scanner.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [toast]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-4 ring-background">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
        autoPlay 
        muted 
        playsInline
      />
      
      <div className="absolute inset-0 border-2 border-dashed border-white/50 m-12 rounded-lg pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-accent animate-pulse shadow-[0_0_10px_#0ea5e9]" />
      </div>

      {hasCameraPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {hasCameraPermission === false && (
        <div className="absolute inset-0 p-4 flex items-center justify-center bg-destructive/10 backdrop-blur-sm">
          <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access to scan machine QR codes.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
          <ScanLine className="size-4 text-accent" />
          <span className="text-[10px] text-white font-medium uppercase tracking-widest">Scanning Active</span>
        </div>
      </div>
    </div>
  )
}
