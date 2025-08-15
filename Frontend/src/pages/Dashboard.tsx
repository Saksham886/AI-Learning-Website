import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatBox } from "@/components/ui/stat-box";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { BookOpen, ClipboardList, Percent, ChevronRight } from "lucide-react";
import { getDashboardData } from "@/api/dashboard";

export default function Dashboard() {
  const { isLoggedIn, authLoading, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    getDashboardData(token)
      .then(data => setDashboardData(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (authLoading) {
    return <div className="text-center mt-10">Checking login...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="text-center mt-10">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-10">No data available</div>;
  }

  const stats = [
    {
      title: "Total Quizzes Given",
      value: dashboardData.total_quiz_given || 0,
      description: "All quizzes you have attempted",
      icon: <ClipboardList className="w-6 h-6" />,
    },
    {
      title: "Total Topics Explained",
      value: dashboardData.total_topics_explained || 0,
      description: "Topics you have written explanations for",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      title: "Average Quiz Percentage",
      value: `${dashboardData.avg_quiz_percent || 0}%`,
      description: "Average score across all quizzes",
      icon: <Percent className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">Here's your learning progress</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <StatBox {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Topics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Your Learning Journey</h2>
              <p className="text-sm text-muted-foreground">Track everything you've learned</p>
            </div>
            <Link to="/progress">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* <div className="space-y-4">
            {dashboardData.recent_topics?.map((topic, index) => (
              <motion.div
                key={`${topic.user_id}-${topic.topic}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {topic.topic}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {topic.updated_at
                        ? new Date(topic.updated_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">
                        {topic.progress ?? (topic.completed ? 100 : 0)}%
                      </span>
                    </div>
                    <Progress
                      value={topic.progress ?? (topic.completed ? 100 : 0)}
                      className="h-2"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div> */}
        </Card>
      </div>
    </div>
  );
}
