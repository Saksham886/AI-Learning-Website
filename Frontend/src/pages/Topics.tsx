import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TopicCard } from "@/components/ui/topic-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { getUserProgress } from "@/api/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
export default function MyProgress() {
  const navigate = useNavigate();
  const { isLoggedIn, authLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedExplanation, setSelectedExplanation] = useState(null);

  const types = [
    { name: "All", count: 0 },
    { name: "Quiz", count: 0 },
    { name: "Explanation", count: 0 },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const data = await getUserProgress(token, selectedType.toLowerCase());
        setProgressList(data.items || []);
      } catch (err) {
        console.error("Error loading progress:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedType]);
  if (authLoading) {
      return <div className="text-center mt-10">Checking login...</div>;
    }
  
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

  const filteredList = progressList.filter(item =>
    item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-muted-foreground">View all your quiz attempts and saved explanations</p>
        </motion.div>

        {/* Search & Type Filter */}
        <Card className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border rounded w-full py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button
                key={type.name}
                variant={selectedType === type.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.name)}
              >
                {type.name}
                <Badge variant="secondary" className="ml-1">{type.count}</Badge>
              </Button>
            ))}
          </div>
        </Card>

        {/* Progress Grid */}
        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="text-muted-foreground">Try changing filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <TopicCard
                  title={item.topic}
                  description={item.type === "quiz"
                    ? `Score: ${item.quiz_score}/${item.total_questions}`
                    : `${item.explanation?.slice(0, 100)}...`}
                  difficulty={item.level}
                  completed={item.completed}
                  progress={item.type === "quiz"
                    ? Math.round((item.quiz_score / item.total_questions) * 100)
                    : 0}
                  onClick={() => {
                    if (item.type === "quiz") {
                      navigate(`/quiz-review/${item.topic}`);
                    } else {
                      setSelectedExplanation(item);
                    }
                  }}
                  duration=""
                />
              </motion.div>
            ))}
          </div>
        )}
        {/* Modal for Explanation */}
        {selectedExplanation && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] shadow-lg relative overflow-y-auto">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                onClick={() => setSelectedExplanation(null)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">{selectedExplanation.topic}</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {selectedExplanation.explanation}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
