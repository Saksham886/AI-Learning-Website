import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Search,
  Lightbulb,
  Brain,
  Loader
} from "lucide-react";
import { explain } from "@/api/function";
import {saveExplanation} from "@/api/explain"
import jsPDF from "jspdf";
export default function TopicExplainer() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasExplanation, setHasExplanation] = useState(false);
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  
    // Add title
    doc.text("AI Explanation", 10, 10);
  
    // Add summary text (auto-wraps if long)
    const lines = doc.splitTextToSize(explanation, 180);
    doc.text(lines, 10, 20);
  
    // Save PDF
    doc.save(`${topic}.pdf`);
  };
  const handleExplain = async () => {
  if (!topic || !level) return;

  setIsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const { data } = await explain(topic, level);
    setExplanation(`${data.explanation}`);
    setHasExplanation(true);

    // --- Save to backend if logged in ---
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await saveExplanation(token, {
          topic,
          level,
          explanation: data.explanation
        });
        console.log("Explanation saved successfully");
      } catch (err) {
        console.error("Error saving explanation:", err);
      }
    }
  } catch (error) {
    console.error("Error getting explanation:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleReset = () => {
    setTopic("");
    setLevel("");
    setExplanation("");
    setHasExplanation(false);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Topic Explainer</h1>
              <p className="text-muted-foreground">
                Get detailed explanations on any topic at your preferred difficulty level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">What would you like to learn?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., React Hooks, Machine Learning, CSS Grid..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Level Select */}
              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium">
                  Difficulty Level
                </Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Beginner
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Intermediate
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Advanced
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleExplain}
                disabled={!topic || !level || isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Explain Topic
                  </>
                )}
              </Button>
              
              {hasExplanation && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

      {/* Explanation Result */}
      {(isLoading || hasExplanation) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Explanation</h3>
              </div>

              {hasExplanation && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{topic}</Badge>
                  <Badge 
                    variant={
                      level === 'beginner' ? 'default' : 
                      level === 'intermediate' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {level}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Generating explanation for "{topic}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a few moments...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* New attractive explanation box */}
                <div className="p-4 bg-muted/40 rounded-xl border shadow-sm max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert">
                  <p className="whitespace-pre-line">{explanation}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigator.clipboard.writeText(explanation)}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button variant="secondary" onClick={handleDownloadPdf}>Download PDF</Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      </div>
    </div>
  );
}