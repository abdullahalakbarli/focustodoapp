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
  const [minutes, setMinutes] = useState(duration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState("Study");
  const [totalSeconds, setTotalSeconds] = useState(duration * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                setIsActive(false);
                onComplete(25);
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
  }, [isActive, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(duration);
    setSeconds(0);
    setTotalSeconds(duration * 60);
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
