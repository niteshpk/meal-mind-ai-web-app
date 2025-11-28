import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, Square, Volume2, VolumeX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookingTimerProps {
  initialSeconds: number;
  label?: string;
  onComplete?: () => void;
}

export function CookingTimer({
  initialSeconds,
  label = "Timer",
  onComplete,
}: CookingTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize audio context and speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize Speech Synthesis (available immediately)
      if ("speechSynthesis" in window) {
        speechSynthesisRef.current = window.speechSynthesis;
      }

      // AudioContext will be initialized on first user interaction (required by browsers)
      // This prevents autoplay policy issues
    }
  }, []);

  // Initialize audio context on user interaction
  const ensureAudioContext = () => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn("AudioContext not supported:", error);
      }
    }
    return audioContextRef.current;
  };

  // Trigger all alerts when timer completes
  const triggerAlerts = useCallback(() => {
    if (!voiceAlertsEnabled) return;

    // Play alert sound using Web Audio API
    const audioContext = ensureAudioContext();
    if (audioContext) {
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Create a pleasant beep sound
        oscillator.frequency.value = 800; // Higher pitch
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        // Play a second beep after a short delay
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          oscillator2.frequency.value = 800;
          oscillator2.type = "sine";
          gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.5);
        }, 300);
      } catch (error) {
        console.warn("Failed to play alert sound:", error);
      }
    }

    // Speak timer completion announcement
    if (speechSynthesisRef.current) {
      try {
        // Cancel any ongoing speech
        speechSynthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(
          `Timer complete! ${label} is finished.`
        );
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;

        speechSynthesisRef.current.speak(utterance);
      } catch (error) {
        console.warn("Failed to speak announcement:", error);
      }
    }

    // Show browser notification
    if ("Notification" in window) {
      // Request permission if not granted
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            try {
              const notification = new Notification("Timer Complete!", {
                body: `${label} is finished.`,
                icon: "/favicon.ico",
                tag: `timer-${label}`,
                requireInteraction: false,
              });

              // Auto-close after 5 seconds
              setTimeout(() => {
                notification.close();
              }, 5000);
            } catch (error) {
              console.warn("Failed to show notification:", error);
            }
          }
        });
      } else if (Notification.permission === "granted") {
        try {
          const notification = new Notification("Timer Complete!", {
            body: `${label} is finished.`,
            icon: "/favicon.ico",
            tag: `timer-${label}`,
            requireInteraction: false,
          });

          // Auto-close after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (error) {
          console.warn("Failed to show notification:", error);
        }
      }
    }
  }, [voiceAlertsEnabled, label]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
            // Trigger voice alerts when timer completes
            triggerAlerts();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete, triggerAlerts]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSeconds(initialSeconds);
    setIsRunning(false);
    setIsComplete(false);
  };

  const handleToggle = () => {
    // Initialize audio context on first user interaction
    ensureAudioContext();
    
    if (isComplete) {
      handleReset();
    } else {
      setIsRunning(!isRunning);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${isComplete ? "text-green-500" : "text-primary"}`} />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p
              className={`text-2xl font-bold ${
                isComplete ? "text-green-500" : ""
              }`}
            >
              {formatTime(seconds)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Voice Alerts Toggle */}
      <div className="mt-3 flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          {voiceAlertsEnabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
          <Label htmlFor="voice-alerts" className="text-sm cursor-pointer">
            Voice Alerts
          </Label>
        </div>
        <Switch
          id="voice-alerts"
          checked={voiceAlertsEnabled}
          onCheckedChange={setVoiceAlertsEnabled}
        />
      </div>

      {isComplete && (
        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 text-sm text-center">
          ⏰ Timer Complete!
        </div>
      )}
    </Card>
  );
}

