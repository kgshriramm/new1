import React, { useState, useEffect } from "react";
import { Resume, JobDescription, Analysis } from "@/entities/all";
import { FileText, Users, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resumes: 0, jobs: 0, analyses: 0, avgScore: 0 });
  const [topCandidates, setTopCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumesData, jobsData, analysesData] = await Promise.all([
        Resume.list(),
        JobDescription.list(),
        Analysis.list('-overall_score')
      ]);
      
      const avgScore = analysesData.length > 0 
        ? Math.round(analysesData.reduce((sum, a) => sum + a.overall_score, 0) / analysesData.length)
        : 0;
      
      setStats({
        resumes: resumesData.length,
        jobs: jobsData.filter(j => j.is_active !== false).length,
        analyses: analysesData.length,
        avgScore
      });

      const candidateMap = new Map(resumesData.map(r => [r.id, r]));
      const jobMap = new Map(jobsData.map(j => [j.id, j]));

      const populatedTopCandidates = analysesData.slice(0, 5).map(analysis => ({
        analysis,
        candidate: candidateMap.get(analysis.resume_id),
        job: jobMap.get(analysis.job_description_id),
      })).filter(item => item.candidate && item.job);

      setTopCandidates(populatedTopCandidates);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    return (
      <div className="p-6 md:p-8 flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recruitment Dashboard</h1>
          <p className="text-slate-600">AI-powered candidate analysis and evaluation at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Upload"))}>Create Job</Button>
          <Button onClick={() => navigate(createPageUrl("Upload"))}>Upload Resume</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Candidates" value={stats.resumes} icon={Users} bgGradient="from-blue-500 to-blue-600" trend="up" trendValue="+12%" />
        <StatsCard title="Active Jobs" value={stats.jobs} icon={Target} bgGradient="from-teal-500 to-teal-600" trend="up" trendValue="+2" />
        <StatsCard title="Analyses Ran" value={stats.analyses} icon={FileText} bgGradient="from-purple-500 to-purple-600" trend="up" trendValue="+34" />
        <StatsCard title="Average Match" value={`${stats.avgScore}%`} icon={TrendingUp} bgGradient="from-amber-500 to-amber-600" trend="down" trendValue="-2%" />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Top Ranked Candidates</h2>
          {topCandidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied For</TableHead>
                  <TableHead className="text-center">Overall Score</TableHead>
                  <TableHead>Date Analyzed</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCandidates.map(({ analysis, candidate, job }) => (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <div className="font-medium">{candidate.candidate_name}</div>
                      <div className="text-sm text-slate-500">{candidate.email}</div>
                    </TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getScoreColor(analysis.overall_score)} font-semibold text-sm`}>
                        {analysis.overall_score}%
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(analysis.created_date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl(`AnalysisDetails?analysisId=${analysis.id}`))}>
                        View Analysis
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-slate-700">No Analyses Found</h3>
              <p className="text-slate-500 mt-2">Run an analysis from the Job Descriptions page to see results here.</p>
              <Button className="mt-4" onClick={() => navigate(createPageUrl("JobDescriptions"))}>Go to Jobs</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}