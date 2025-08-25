"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  FileText,
  Link as LinkIcon,
  Loader,
  BookMarked,
  ClipboardCopy,
  Download
} from "lucide-react";
import {summarizeUrl,summarizePdf} from "@/api/summary"
import jsPDF from "jspdf";
export default function Summarizer() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
const handleDownloadPdf = () => {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  // Add title
  doc.text("AI Summary", 10, 10);

  // Add summary text (auto-wraps if long)
  const lines = doc.splitTextToSize(summary, 180);
  doc.text(lines, 10, 20);

  // Save PDF
  doc.save("summary.pdf");
};

  const handleSummarize = async () => {
  if (!url && !file) return;

  setIsLoading(true);
  try {
    let data;

    // --- Call your backend summarize API ---
    if (url) {
      const res = await summarizeUrl(url,language);
      data = res;
    } else if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      const res = await summarizePdf(formData);
      data = res;
    }

    setSummary(`${data.summary}`);
    setHasSummary(true);

    // // --- Save to backend if logged in ---
    // const token = localStorage.getItem("token");
    // if (token) {
    //   try {
    //     await saveSummary(token, {
    //       url: url || null,
    //       fileName: file ? file.name : null,
    //       summary: data.summary,
    //     });
    //     console.log("Summary saved successfully");
    //   } catch (err) {
    //     console.error("Error saving summary:", err);
    //   }
    // }
  } catch (error) {
    console.error("Error generating summary:", error);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Summarizer</h1>
              <p className="text-muted-foreground">
                Summarize PDFs or URLs into concise key points in any language
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}>
          <Card className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="url">Enter URL</Label>
                <Input id="url" value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://example.com/article"/>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Upload PDF</Label>
                <Input id="file" type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)}/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" value={language} onChange={(e)=>setLanguage(e.target.value)} placeholder="English"/>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSummarize} disabled={isLoading || (!url && !file)}>
                {isLoading ? <><Loader className="w-4 h-4 mr-2 animate-spin"/> Summarizing...</> : "Summarize"}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Summary Output */}
        {hasSummary && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}}>
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary"/> Summary
                </h3>
              </div>
              <Separator/>
              <div className="p-4 bg-muted/40 rounded-xl border shadow-sm max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert whitespace-pre-line">
                {summary}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>navigator.clipboard.writeText(summary)}>
                  <ClipboardCopy className="w-4 h-4 mr-2"/> Copy
                </Button>
                {language === "English" && (
                  <Button variant="secondary" onClick={handleDownloadPdf}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                )}

              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
