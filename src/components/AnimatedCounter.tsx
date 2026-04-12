import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  target: number | null;
  label: string;
  duration?: number;
}

const AnimatedCounter = ({ target, label, duration = 2000 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const isLoading = target === null;

  useEffect(() => {
    if (target === null) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="text-muted-foreground text-sm"
    >
      <span className="text-foreground font-heading font-semibold">{isLoading ? "—" : count}</span> {label}
    </motion.span>
  );
};

export default AnimatedCounter;
