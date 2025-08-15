import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getQuizResultByTopic } from "@/api/quizdata";
import { useParams } from "react-router-dom";
import { 
  Trophy, 
  XCircle, 
  CheckCircle, 
  RotateCcw,
  Home,
  Share2,
  Award,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveQuizResult } from "@/api/quizdata";
interface QuizResultData {
  score: number;
  totalQuestions: number;
  topic: string;
  level: string;
  questions: Array<{
    question: string;
    selectedAnswer: number;
    correctAnswer: number;
    options: string[];
    isCorrect: boolean;
  }>;
  timeSpent?: number;
}

export default function QuizResult() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resultData, setResultData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { topic } = useParams();
  useEffect(() => {
  const data = sessionStorage.getItem("quizResult");

  if (data) {
    // Case 1: Fresh quiz result from sessionStorage
    const parsedData = JSON.parse(data);
    setResultData(parsedData);
    console.log(parsedData);

    const token = localStorage.getItem("token");
    if (token) {
      saveQuizResult(token, parsedData)
        .then(() => console.log("Quiz result saved successfully"))
        .catch((err) => console.error("Error saving quiz result:", err));
    }
  } else if (topic) {
    // Case 2: Review old quiz from backend
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    getQuizResultByTopic(token, topic)
      .then((res) => {
        const mappedData = {
      score: res.quiz_score,
      totalQuestions: res.total_questions,
      topic: res.topic,
      level: res.level,
      timeSpent: res.time_spent,
      questions: res.questions,
    };
    setResultData(mappedData);
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Error", description: "Could not load quiz result." });
        navigate("/dashboard");
      });
  } else {
    // Case 3: No data and no topic → redirect
    navigate("/quiz-setup");
  }
}, [topic, navigate, toast]);

  if (!resultData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const percentage = Math.round((resultData.score / resultData.totalQuestions) * 100);
  const passed = percentage >= 70;
  const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'EduGenie Quiz Result',
        text: `I scored ${resultData.score}/${resultData.totalQuestions} (${percentage}%) on a ${resultData.level} ${resultData.topic} quiz!`,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(
        `I scored ${resultData.score}/${resultData.totalQuestions} (${percentage}%) on a ${resultData.level} ${resultData.topic} quiz on EduGenie!`
      );
      toast({
        title: "Copied to clipboard!",
        description: "Share your achievement with friends."
      });
    }
  };

  const handleRetry = () => {
    sessionStorage.removeItem('quizResult');
    navigate('/quiz-setup');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Main Result Card */}
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
                <Target className="w-12 h-12 text-red-600" />
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

            {/* Score Display */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-foreground mb-2">
                  {percentage}%
                </div>
                <div className="text-lg text-muted-foreground">
                  {resultData.score} out of {resultData.totalQuestions} correct
                </div>
                <Badge 
                  className={`mt-2 text-lg px-4 py-1 ${
                    grade === 'A' ? 'bg-green-500' :
                    grade === 'B' ? 'bg-blue-500' :
                    grade === 'C' ? 'bg-yellow-500' :
                    'bg-red-500'
                  } text-white`}
                >
                  Grade: {grade}
                </Badge>
              </div>

              <Progress value={percentage} className="h-3" />
            </div>

            {/* Quiz Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{resultData.score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {resultData.totalQuestions - resultData.score}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary capitalize">
                  {resultData.level}
                </div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {resultData.timeSpent ? `${Math.floor(resultData.timeSpent / 60)}m` : '-'}
                </div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            {/* Topic Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm px-4 py-2">
                Topic: {resultData.topic}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleRetry} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Result
              </Button>
            </div>
          </Card>

          {/* Detailed Results */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Question Review</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {resultData.questions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 border rounded-lg ${
                        question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-foreground">
                            Question {index + 1}: {question.question}
                          </h3>
                          {question.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Your answer:</span>
                            <span className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {question.options[question.selectedAnswer]}
                            </span>
                          </div>
                          {!question.isCorrect && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Correct answer:</span>
                              <span className="text-green-700">
                                {question.options[question.correctAnswer]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </Card>

          {/* Achievement Card */}
          {passed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Achievement Unlocked!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've successfully completed a {resultData.level} level {resultData.topic} quiz
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}