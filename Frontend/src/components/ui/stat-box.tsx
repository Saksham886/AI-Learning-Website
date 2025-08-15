import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatBoxProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export const StatBox = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className
}: StatBoxProps) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={cn("p-6 shadow-card hover:shadow-glow transition-all duration-300", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && trendValue && (
              <p className={cn("text-sm font-medium", trendColors[trend])}>
                {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-primary">
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};