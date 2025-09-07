import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Hash, 
  Play,
  ArrowLeft 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {quiz} from"@/api/function";
interface QuizSetupData {
  numQuestions: number;
  topic: string;
  level: "easy" | "medium" | "hard";
}

export default function QuizSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<QuizSetupData>({
    numQuestions: 5,
    topic: "",
    level: "medium"
  });
  const [isLoading, setIsLoading] = useState(false);

  const popularTopics = [
    "JavaScript", "React", "Python", "Data Science", 
    "Machine Learning", "Web Development", "Algorithms", "Databases"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter or select a topic for your quiz.",
        variant: "destructive"
      });
      return;
    }

    if (formData.numQuestions < 1 || formData.numQuestions > 20) {
      toast({
        title: "Invalid Number",
        description: "Please enter between 1 and 20 questions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response= await quiz(formData.topic,formData.level,formData.numQuestions);
      // Store quiz data in sessionStorage for now
      sessionStorage.setItem("quizData", JSON.stringify({
        topic: formData.topic,
        level: formData.level,
        numQuestions: formData.numQuestions,
        questions: response.data.quiz
      }));
      toast({
        title: "Quiz Created!",
        description: `Generated ${formData.numQuestions} ${formData.level} questions about ${formData.topic}.`
      });
      
      navigate('/quiz');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto"
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground">Create Your Quiz</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Customize your learning experience with AI-generated questions tailored to your needs.
            </p>
          </div>

          {/* Setup Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Number of Questions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="numQuestions" className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="w-4 h-4" />
                  Number of Questions
                </Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numQuestions}
                  onChange={(e) => {
                    let value = parseInt(e.target.value) || 1;
                    if (value < 1) value = 1;
                    if (value > 20) value = 20; 
                    setFormData(prev => ({ 
                      ...prev, 
                      numQuestions: value 
                    }));
                  }}
                  className="text-center"
                />

                <p className="text-xs text-muted-foreground">Choose between 1 and 20 questions</p>
              </motion.div>

              {/* Topic */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <Label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="Enter a topic (e.g., JavaScript, React, Python)"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    topic: e.target.value 
                  }))}
                />
                
                {/* Popular Topics */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Or choose from popular topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setFormData(prev => ({ ...prev, topic }))}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Difficulty Level */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Target className="w-4 h-4" />
                  Difficulty Level
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: "easy" | "medium" | "hard") => 
                    setFormData(prev => ({ ...prev, level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Easy
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="hard">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Hard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 pt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/topics')}
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Topics
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </Card>

          {/* Preview Summary */}
          {formData.topic && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Quiz Preview</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.numQuestions} {formData.level} questions about {formData.topic}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {formData.level}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
