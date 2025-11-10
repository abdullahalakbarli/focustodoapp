import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";

interface TimerContextType {
  minutes: number;
  seconds: number;
  isActive: boolean;
  category: string;
  sessionTotalSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  inProgressSeconds: number;
  inProgressMinutes: number;
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
  onComplete: (payload: { durationMinutes: number; awardedIntervals: number }) => void;
  onProgress?: (intervalIncrements: number) => void;
  onSegment?: (payload: { category: string; minutes: number }) => void;
}

type PersistedTimerState = {
  remainingSeconds: number;
  sessionTotalSeconds: number;
  isActive: boolean;
  category: string;
  awardedIntervals: number;
  inProgressSeconds: number;
  categoryAccumulatedSeconds: number;
  flushedMinutes: number;
  duration: number;
  lastSaved: number;
};

const TIMER_STORAGE_KEY = "timerState";

const nowSeconds = () => Math.floor(Date.now() / 1000);

const loadSavedState = (): PersistedTimerState | null => {
  try {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as PersistedTimerState;
    return parsed;
  } catch {
    return null;
  }
};

export const TimerProvider = ({ children, onComplete, onProgress, onSegment }: TimerProviderProps) => {
  const [duration, setDurationState] = useState(() => {
    const saved = localStorage.getItem("focusDuration");
    return saved ? parseInt(saved) : 25;
  });

  const savedTimerState = loadSavedState();

  const sessionTotalInitial = savedTimerState?.sessionTotalSeconds ?? duration * 60;
  const lastSaved = savedTimerState?.lastSaved ?? nowSeconds();
  const savedRemaining = savedTimerState?.remainingSeconds ?? sessionTotalInitial;
  const wasActive = savedTimerState?.isActive ?? false;

  const elapsedSinceSave = wasActive ? Math.max(0, nowSeconds() - lastSaved) : 0;
  const calculatedRemaining = Math.max(savedRemaining - elapsedSinceSave, 0);

  const [sessionTotalSeconds, setSessionTotalSeconds] = useState(sessionTotalInitial);
  const [remainingSeconds, setRemainingSeconds] = useState(calculatedRemaining);
  const [isActive, setIsActive] = useState(() => wasActive && calculatedRemaining > 0);
  const [categoryState, setCategoryState] = useState(() => savedTimerState?.category ?? "Study");
  const [awardedIntervals, setAwardedIntervals] = useState(() => savedTimerState?.awardedIntervals ?? 0);
  const [inProgressSeconds, setInProgressSeconds] = useState(() => {
    const persisted = savedTimerState?.inProgressSeconds ?? 0;
    const derived = sessionTotalInitial - calculatedRemaining;
    return Math.max(persisted, derived);
  });
  const [categoryAccumulatedSeconds, setCategoryAccumulatedSeconds] = useState(
    () => savedTimerState?.categoryAccumulatedSeconds ?? 0
  );
  const [flushedMinutes, setFlushedMinutes] = useState(() => savedTimerState?.flushedMinutes ?? 0);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const elapsedSeconds = Math.max(0, sessionTotalSeconds - remainingSeconds);
  const inProgressMinutes = Math.floor(inProgressSeconds / 60);

  const category = categoryState;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestOnComplete = useRef(onComplete);
  const latestOnProgress = useRef(onProgress);
  const latestOnSegment = useRef(onSegment);
  const categoryRef = useRef(categoryState);

  useEffect(() => {
    latestOnComplete.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    latestOnProgress.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    latestOnSegment.current = onSegment;
  }, [onSegment]);

  useEffect(() => {
    categoryRef.current = categoryState;
  }, [categoryState]);

  const persistState = useCallback(
    (stateOverrides?: Partial<PersistedTimerState>) => {
      const state: PersistedTimerState = {
        remainingSeconds,
        sessionTotalSeconds,
        isActive,
        category: categoryState,
        awardedIntervals,
        inProgressSeconds,
        categoryAccumulatedSeconds,
        flushedMinutes,
        duration,
        lastSaved: nowSeconds(),
        ...stateOverrides,
      };
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore persistence failures
      }
    },
    [
      awardedIntervals,
      categoryState,
      categoryAccumulatedSeconds,
      duration,
      flushedMinutes,
      inProgressSeconds,
      isActive,
      remainingSeconds,
      sessionTotalSeconds,
    ]
  );

  useEffect(() => {
    persistState();
  }, [persistState]);

  const flushCategory = useCallback(
    (categoryName: string, includeRemainder: boolean) => {
      setCategoryAccumulatedSeconds((currentSeconds) => {
        if (currentSeconds <= 0) {
          return currentSeconds;
        }

        const secondsToUse = includeRemainder ? currentSeconds : currentSeconds - (currentSeconds % 60);
        if (secondsToUse <= 0) {
          return currentSeconds;
        }

        const minutesValue = includeRemainder
          ? Math.round((secondsToUse / 60) * 100) / 100
          : secondsToUse / 60;

        if (latestOnSegment.current && minutesValue > 0) {
          latestOnSegment.current({
            category: categoryName,
            minutes: minutesValue,
          });
          setFlushedMinutes((prev) => prev + minutesValue);
        }

        const remainder = includeRemainder ? 0 : currentSeconds - secondsToUse;
        return remainder;
      });
    },
    []
  );

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setCategoryAccumulatedSeconds((prev) => prev + 1);
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setInProgressSeconds(sessionTotalSeconds);
            flushCategory(categoryRef.current, true);
            setAwardedIntervals((prevIntervals) => {
              const totalIntervals = Math.floor(sessionTotalSeconds / 600);
              if (totalIntervals > prevIntervals && latestOnProgress.current) {
                latestOnProgress.current(totalIntervals - prevIntervals);
              }
              return totalIntervals;
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("timer:complete"));
            }
            persistState({
              remainingSeconds: 0,
              inProgressSeconds: sessionTotalSeconds,
              isActive: false,
              lastSaved: nowSeconds(),
            });
            latestOnComplete.current({
              durationMinutes: sessionTotalSeconds / 60,
              awardedIntervals,
            });
            localStorage.removeItem(TIMER_STORAGE_KEY);
            return 0;
          }

          const nextRemaining = prev - 1;
          setInProgressSeconds((prevProgress) =>
            Math.max(prevProgress, sessionTotalSeconds - nextRemaining)
          );

          const elapsed = sessionTotalSeconds - nextRemaining;
          if (elapsed > 0 && elapsed % 600 === 0) {
            setAwardedIntervals((prevIntervals) => {
              const target = elapsed / 600;
              if (target > prevIntervals && latestOnProgress.current) {
                latestOnProgress.current(target - prevIntervals);
              }
              return target;
            });
          }

          if (elapsed > 0 && elapsed % 60 === 0 && typeof window !== "undefined") {
            window.dispatchEvent(new Event("timer:minute"));
          }

          return nextRemaining;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [awardedIntervals, duration, isActive, persistState, sessionTotalSeconds]);

  const toggleTimer = () => {
    setIsActive((prev) => {
      const wasActive = prev;
      if (wasActive) {
        flushCategory(categoryRef.current, false);
      }
      const next = !prev && remainingSeconds > 0;
      persistState({ isActive: next, lastSaved: nowSeconds() });
      return next;
    });
  };

  const changeCategory = (nextCategory: string) => {
    if (nextCategory === categoryRef.current) return;
    flushCategory(categoryRef.current, false);
    setCategoryState(nextCategory);
    persistState({ category: nextCategory, lastSaved: nowSeconds() });
  };

  const resetTimer = () => {
    flushCategory(categoryRef.current, true);
    const startingSeconds = duration * 60;
    setIsActive(false);
    setSessionTotalSeconds(startingSeconds);
    setRemainingSeconds(startingSeconds);
    setAwardedIntervals(0);
    setInProgressSeconds(0);
    setCategoryAccumulatedSeconds(0);
    setFlushedMinutes(0);
    persistState({
      isActive: false,
      remainingSeconds: startingSeconds,
      sessionTotalSeconds: startingSeconds,
      awardedIntervals: 0,
      inProgressSeconds: 0,
      categoryAccumulatedSeconds: 0,
      flushedMinutes: 0,
      lastSaved: nowSeconds(),
    });
  };

  const setDuration = (newDuration: number) => {
    flushCategory(categoryRef.current, true);
    setDurationState(newDuration);
    localStorage.setItem("focusDuration", newDuration.toString());
    const startingSeconds = newDuration * 60;
    setIsActive(false);
    setSessionTotalSeconds(startingSeconds);
    setRemainingSeconds(startingSeconds);
    setAwardedIntervals(0);
    setInProgressSeconds(0);
    setCategoryAccumulatedSeconds(0);
    setFlushedMinutes(0);
    persistState({
      duration: newDuration,
      isActive: false,
      remainingSeconds: startingSeconds,
      sessionTotalSeconds: startingSeconds,
      awardedIntervals: 0,
      inProgressSeconds: 0,
      categoryAccumulatedSeconds: 0,
      flushedMinutes: 0,
      lastSaved: nowSeconds(),
    });
  };

  const onSessionComplete = () => {
    flushCategory(categoryRef.current, true);
    latestOnComplete.current({
      durationMinutes: sessionTotalSeconds / 60,
      awardedIntervals,
    });
    setAwardedIntervals(0);
    setInProgressSeconds(0);
    setCategoryAccumulatedSeconds(0);
    setFlushedMinutes(0);
    persistState({
      awardedIntervals: 0,
      inProgressSeconds: 0,
      categoryAccumulatedSeconds: 0,
      flushedMinutes: 0,
      isActive: false,
      remainingSeconds: 0,
    });
  };

  return (
    <TimerContext.Provider
      value={{
        minutes,
        seconds,
        isActive,
        category,
        sessionTotalSeconds,
        remainingSeconds,
        elapsedSeconds,
        inProgressSeconds,
        inProgressMinutes,
        duration,
        toggleTimer,
        resetTimer,
        setCategory: changeCategory,
        setDuration,
        onSessionComplete,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
