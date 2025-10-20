import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface TimerContextType {
  minutes: number;
  seconds: number;
  isActive: boolean;
  category: string;
  totalSeconds: number;
  duration: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  setCategory: (category: string) => void;
  setDuration: (duration: number) => void;
  onSessionComplete: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
  onComplete: (minutes: number) => void;
}

export const TimerProvider = ({ children, onComplete }: TimerProviderProps) => {
  const [duration, setDurationState] = useState(() => {
    const saved = localStorage.getItem("focusDuration");
    return saved ? parseInt(saved) : 25;
  });
  
  // Load saved timer state once to initialize all values
  const loadSavedState = () => {
    const savedState = localStorage.getItem("timerState");
    if (!savedState) return null;
    
    const parsed = JSON.parse(savedState);
    const { minutes: savedMinutes, seconds: savedSeconds, isActive, lastSaved } = parsed;
    
    // If timer was active, calculate elapsed time
    if (isActive && lastSaved) {
      const elapsed = Math.floor((Date.now() - lastSaved) / 1000);
      const totalSavedSeconds = savedMinutes * 60 + savedSeconds;
      const newTotalSeconds = Math.max(0, totalSavedSeconds - elapsed);
      const newMinutes = Math.floor(newTotalSeconds / 60);
      const newSeconds = newTotalSeconds % 60;
      
      return {
        ...parsed,
        minutes: newMinutes,
        seconds: newSeconds,
        isActive: newMinutes > 0 || newSeconds > 0, // Only restore active if time remaining
      };
    }
    
    return parsed;
  };
  
  const savedTimerState = loadSavedState();
  
  const [minutes, setMinutes] = useState(() => savedTimerState?.minutes ?? duration);
  const [seconds, setSeconds] = useState(() => savedTimerState?.seconds ?? 0);
  const [isActive, setIsActive] = useState(() => savedTimerState?.isActive ?? false);
  const [category, setCategory] = useState(() => savedTimerState?.category ?? "Study");
  const [totalSeconds, setTotalSeconds] = useState(() => savedTimerState?.totalSeconds ?? duration * 60);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      minutes,
      seconds,
      isActive,
      category,
      totalSeconds,
      lastSaved: Date.now(),
    };
    localStorage.setItem("timerState", JSON.stringify(timerState));
  }, [minutes, seconds, isActive, category, totalSeconds]);

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                setIsActive(false);
                onComplete(duration);
                // Clear saved state when timer completes
                localStorage.removeItem("timerState");
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
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
  }, [isActive, onComplete, duration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(duration);
    setSeconds(0);
    setTotalSeconds(duration * 60);
    // Clear saved state when manually resetting
    localStorage.removeItem("timerState");
  };

  const setDuration = (newDuration: number) => {
    setDurationState(newDuration);
    localStorage.setItem("focusDuration", newDuration.toString());
    setMinutes(newDuration);
    setSeconds(0);
    setTotalSeconds(newDuration * 60);
    setIsActive(false);
  };

  const onSessionComplete = () => {
    onComplete(duration);
  };

  return (
    <TimerContext.Provider
      value={{
        minutes,
        seconds,
        isActive,
        category,
        totalSeconds,
        duration,
        toggleTimer,
        resetTimer,
        setCategory,
        setDuration,
        onSessionComplete,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
