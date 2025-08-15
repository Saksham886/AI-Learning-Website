import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface QuizData {
  numQuestions: number;
  topic: string;
  level: "easy" | "medium" | "hard";
}

export default function Quiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  // Load quiz data on component mount
  useEffect(() => {
    const data = sessionStorage.getItem('quizData');
    if (data) {
      const parsed = JSON.parse(data);
  setQuizData({
    topic: parsed.topic,
    level: parsed.level,
    numQuestions: parsed.numQuestions
  });
  setQuestions(parsed.questions);
    } else {
      // If no quiz data, redirect to quiz setup
      navigate('/quiz-setup');
      return;
    }
    
    // Simulate loading time for questions
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !quizComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit();
    }
  }, [timeLeft, showResult, quizComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null && timeLeft > 0) {
      toast({
        title: "Please select an answer",
        description: "Choose an option before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer ?? -1;
    setAnswers(newAnswers);

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      // Quiz complete - save results and redirect
      const quizResult = {
        score,
        totalQuestions: questions.length,
        topic: quizData?.topic || "Unknown",
        level: quizData?.level || "medium",
        questions: questions.map((q, index) => ({
          question: q.question,
          selectedAnswer: answers[index] ?? -1,
          correctAnswer: q.correctAnswer,
          options: q.options,
          isCorrect: (answers[index] ?? -1) === q.correctAnswer
        })),
        timeSpent: questions.length * 30 - timeLeft // Approximate time
      };
      
      sessionStorage.setItem('quizResult', JSON.stringify(quizResult));
      navigate('/quiz-result');
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setTimeLeft(30);
    setQuizComplete(false);
  };

  // Show loading screen while quiz data loads
  if (isLoading || !quizData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (quizComplete) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {passed ? (
                  <Trophy className="w-12 h-12 text-green-600" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Quiz Complete!
                </h1>
                <p className="text-muted-foreground">
                  {passed ? "Congratulations! You passed!" : "Keep studying and try again!"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {score}/{questions.length}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {percentage.toFixed(0)}% Score
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{questions.length}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleRestart} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Back to Topics
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground capitalize">
                {quizData.topic} Quiz
              </h1>
              <p className="text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length} • {quizData.level} level
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-foreground leading-relaxed">
                    {currentQ.question}
                  </h2>
                  <Badge 
                    className={`${
                      currentQ.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                      currentQ.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentQ.difficulty}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedAnswer === index
                          ? showResult
                            ? index === currentQ.correctAnswer
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-red-500 bg-red-50 text-red-700"
                            : "border-primary bg-primary/5 text-primary"
                          : showResult && index === currentQ.correctAnswer
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && (
                          <div className="flex items-center gap-1">
                            {index === currentQ.correctAnswer ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : selectedAnswer === index ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Explanation */}
                {showResult && currentQ.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Explanation</h4>
                        <p className="text-blue-800 text-sm">{currentQ.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate('/quiz-setup')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {!showResult ? (
                    <Button onClick={handleSubmit} className="gap-2">
                      Submit Answer
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="gap-2">
                      {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Score</span>
              <span className="font-medium text-foreground">
                {score} / {currentQuestion + (showResult ? 1 : 0)} correct
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}