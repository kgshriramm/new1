import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Analysis, Resume, JobDescription } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, User, Briefcase, FileText } from "lucide-react";
import { createPageUrl } from "@/utils";
import BreakdownRadarChart from "../components/analysis/BreakdownRadarChart";
import ResumeHeatmap from "../components/analysis/ResumeHeatmap";
import SkillsAnalysis from "../components/analysis/SkillsAnalysis";

export default function AnalysisDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const analysisId = params.get('analysisId');
    if (analysisId) {
      loadAnalysisData(analysisId);
    } else {
      setIsLoading(false);
    }
  }, [location.search]);

  const loadAnalysisData = async (analysisId) => {
    try {
      const analysisData = await Analysis.get(analysisId);
      if (analysisData) {
        setAnalysis(analysisData);
        const [resumeData, jobData] = await Promise.all([
          Resume.get(analysisData.resume_id),
          JobDescription.get(analysisData.job_description_id),
        ]);
        setResume(resumeData);
        setJob(jobData);
      }
    } catch (error) {
      console.error("Failed to load analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
  }

  if (!analysis || !resume || !job) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold">Analysis not found</h2>
        <p className="mt-2 text-slate-600">The requested analysis could not be loaded.</p>
        <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge className={`text-lg font-bold ${getScoreColor(analysis.overall_score)}`}>
            Overall Score: {analysis.overall_score}%
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Candidate</CardTitle></CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold text-slate-900">{resume.candidate_name}</h3>
              <p className="text-slate-600">{resume.email}</p>
              {resume.phone && <p className="text-slate-600">{resume.phone}</p>}
            </CardContent>
          </Card>
           <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
              <p className="text-slate-600">{job.company}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ResumeHeatmap 
              resumeText={resume.extracted_text}
              debiasedText={analysis.debiased_text}
              heatmapData={analysis.relevance_heatmap_data}
            />
             <Card>
              <CardHeader><CardTitle>Detailed Report</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-slate-700">{analysis.detailed_analysis}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
              <CardContent>
                <BreakdownRadarChart analysis={analysis} />
              </CardContent>
            </Card>
            <SkillsAnalysis analysis={analysis} />
          </div>
        </div>
      </div>
    </div>
  );
}