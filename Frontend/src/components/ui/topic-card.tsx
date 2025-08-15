import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, BookOpen } from "lucide-react";

interface TopicCardProps {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  completed?: boolean;
  locked?: boolean;
  progress?: number;
  onClick?: () => void;
  className?: string;
}

export const TopicCard = ({
  title,
  description,
  difficulty,
  duration,
  completed = false,
  locked = false,
  progress = 0,
  onClick,
  className
}: TopicCardProps) => {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800"
  };

  return (
    <motion.div
      whileHover={{ scale: locked ? 1 : 1.02 }}
      whileTap={{ scale: locked ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className={cn(
          "p-6 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer",
          locked && "opacity-60 cursor-not-allowed",
          completed && "ring-2 ring-green-500/20",
          className
        )}
        onClick={locked ? undefined : onClick}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{title}</h3>
                {completed && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {duration}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              {difficulty}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge className={difficultyColors[difficulty]}>
              {difficulty}
            </Badge>
            
            {progress > 0 && !completed && (
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
            )}
          </div>

          {!locked && (
            <Button 
              className="w-full" 
              variant={completed ? "secondary" : "default"}
            >
              {completed ? "Review" : "Start Learning"}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};