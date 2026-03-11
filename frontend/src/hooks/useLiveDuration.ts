import { useState, useEffect } from "react";

/**
 * Hook tính thời gian đã trôi qua từ startTime, cập nhật mỗi giây (thời gian thực)
 */
export function useLiveDuration(startTime: Date | null): string {
  const [duration, setDuration] = useState("0 min");

  useEffect(() => {
    if (!startTime) return;

    const update = () => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (diffHours > 0) {
        setDuration(`${diffHours}h ${mins}m`);
      } else {
        setDuration(`${diffMins} min`);
      }
    };

    update();
    const interval = setInterval(update, 10000); // Cập nhật mỗi 10s (thời gian thực)
    return () => clearInterval(interval);
  }, [startTime]);

  return duration;
}
