import { useState, useEffect } from "react";

export const useCountUp = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationId = null;

    const animate = (currentTime) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.floor(endValue * easeProgress);
      setCount(currentValue);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [endValue, duration]);

  return count;
};
