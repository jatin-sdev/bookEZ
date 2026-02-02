import { useTimer as useReactTimer } from 'react-timer-hook';

export function useTimer(expiryTimestamp: Date | null, onExpire?: () => void) {
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useReactTimer({
    expiryTimestamp: expiryTimestamp || new Date(),
    onExpire,
    autoStart: !!expiryTimestamp,
  });

  return {
    parsedSeconds: seconds,
    minutes,
    hours,
    days,
    isRunning,
    formattedTime: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
    isExpired: !isRunning && !!expiryTimestamp && new Date() > expiryTimestamp
  };
}