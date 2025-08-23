import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  Zap, 
  Target,
  ArrowRight,
  Play
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to your pace and style"
    },
    {
      icon: Target,
      title: "Targeted Practice",
      description: "Focus on areas that need improvement with smart recommendations"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Learn alongside peers and get help when you need it"
    }
  ];

const stats = [
  { value: "5K+", label: "Explanations Given" },
  { value: "2K+", label: "Summaries Generated" },
  { value: "1K+", label: "Quizzes Created" },
  { value: "90%", label: "Student Satisfaction" }
];


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  AI-Powered Learning Platform
                </motion.div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Learn Smarter with{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    AI Assistance
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Master new skills faster than ever with our AI-driven learning platform. 
                  Get personalized lessons, instant feedback, and track your progress in real-time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="group">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-primary rounded-3xl p-8 shadow-glow"
                >
                  <div className="bg-white/90 backdrop-blur rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Explore, Learn, and Grow with AI Assistance</h3>
                        {/* <p className="text-sm text-muted-foreground">Progress: 78%</p> */}
                      </div>
                    </div>
                    {/* <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-primary h-3 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>12 lessons completed</span>
                      <span>3 lessons remaining</span>
                    </div> */}
                  </div>
                </motion.div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-lg"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Why Choose EduGenie?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of education with our cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-glow transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
              <div className="relative p-12 text-center space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Ready to Start Learning?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of learners who are already advancing their skills with EduGenie
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <Button size="lg" className="group">
                      Start Learning Today
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}