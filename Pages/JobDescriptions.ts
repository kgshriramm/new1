import React, { useState, useEffect } from "react";
import { JobDescription, Resume, Analysis } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Target, Users, Play, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function JobDescriptions() {
  const navigate = useNavigate();
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingJobs, setProcessingJobs] = useState(new Set());
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, resumesData] = await Promise.all([
        JobDescription.list('-created_date'),
        Resume.list('-created_date')
      ]);
      
      setJobDescriptions(jobsData);
      setResumes(resumesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setAlert({ type: 'error', message: 'Failed to load data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAllCandidates = async (jobDescription) => {
    if (resumes.length === 0) {
      setAlert({ type: 'warning', message: 'No candidates found. Please upload resumes first.' });
      return;
    }

    setProcessingJobs(prev => new Set([...prev, jobDescription.id]));
    
    try {
      let successCount = 0;
      let existingCount = 0;
      
      for (const resume of resumes) {
        const result = await analyzeCandidate(resume, jobDescription);
        if (result.status === 'analyzed') successCount++;
        if (result.status === 'skipped') existingCount++;
      }

      let message = '';
      if (successCount > 0) {
        message += `Successfully analyzed ${successCount} new candidate${successCount !== 1 ? 's' : ''}. `;
      }
      if (existingCount > 0) {
        message += `${existingCount} candidate${existingCount !== 1 ? 's were' : ' was'} already analyzed. `;
      }
      if (message === '') {
        message = 'No new candidates to analyze.';
      }

      setAlert({ 
        type: 'success', 
        message: `${message} for ${jobDescription.title}.`
      });

    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: `Error during analysis: ${error.message}` 
      });
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobDescription.id);
        return newSet;
      });
    }
  };

  const analyzeCandidate = async (resume, jobDescription) => {
    const existingAnalysis = await Analysis.filter({ 
      resume_id: resume.id, 
      job_description_id: jobDescription.id 
    });
    
    if (existingAnalysis.length > 0) {
      return { status: 'skipped' };
    }

    const analysisPrompt = `
You are an expert AI recruiter system with three specialized agents analyzing a candidate's resume against a job description.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Description: ${jobDescription.description}

CANDIDATE RESUME TEXT:
${resume.extracted_text}

---
YOUR TASK: Perform a comprehensive analysis and return a JSON object with the specified structure.

ANALYSIS FRAMEWORK:
1.  **Hard Skills Agent:** Analyze exact skill matches, certifications, and technical requirements. Be strict.
2.  **Semantic Fit Agent:** Go beyond keywords. Evaluate experience relevance, project impact, and contextual understanding. For the 'relevance_heatmap_data', break down the resume into meaningful snippets (like job descriptions, project details, or key sentences) and assign a relevance score (0-100) to each, explaining your reasoning.
3.  **Bias & Fairness Agent:** Identify potential bias indicators (age, gendered language, etc.). Generate a 'debiased_text' version of the resume by redacting this information, replacing it with placeholders like [REDACTED_DATE] or [REDACTED_NAME].

Based on the combined analysis, provide a final 'overall_score' and a 'detailed_analysis' summary.
`;

    const analysisResult = await InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          hard_skills_score: { type: "number" },
          semantic_fit_score: { type: "number" },
          bias_score: { type: "number" },
          matched_skills: { type: "array", items: { type: "string" } },
          missing_skills: { type: "array", items: { type: "string" } },
          inferred_skills: { type: "array", items: { type: "string" } },
          experience_relevance: { type: "object", properties: { score: { type: "number" }, reasoning: { type: "string" } } },
          education_fit: { type: "object", properties: { score: { type: "number" }, reasoning: { type: "string" } } },
          projects_impact: { type: "object", properties: { score: { type: "number" }, reasoning: { type: "string" } } },
          bias_flags: { type: "array", items: { type: "object", properties: { type: { type: "string" }, description: { type: "string" }, severity: { type: "string", enum: ["low", "medium", "high"] } } } },
          recommendations: { type: "array", items: { type: "string" } },
          detailed_analysis: { type: "string" },
          relevance_heatmap_data: { type: "array", items: { type: "object", properties: { snippet: { type: "string" }, score: { type: "number" }, reasoning: { type: "string" } } } },
          debiased_text: { type: "string" }
        },
        required: ["overall_score", "hard_skills_score", "semantic_fit_score", "bias_score", "relevance_heatmap_data", "debiased_text"]
      }
    });

    await Analysis.create({
      resume_id: resume.id,
      job_description_id: jobDescription.id,
      ...analysisResult
    });
    
    return { status: 'analyzed' };
  };

  const getExperienceLevelColor = (level) => {
    const colors = {
      entry: 'bg-green-100 text-green-800 border-green-200',
      mid: 'bg-blue-100 text-blue-800 border-blue-200',
      senior: 'bg-purple-100 text-purple-800 border-purple-200',
      executive: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Descriptions</h1>
            <p className="text-slate-600">Manage job postings and initiate candidate analysis.</p>
          </div>
          <Button onClick={() => navigate(createPageUrl("Upload"))}>Create New Job</Button>
        </div>

        {alert && (
          <Alert className={
            alert.type === 'success' ? 'border-emerald-200 bg-emerald-50' :
            alert.type === 'warning' ? 'border-amber-200 bg-amber-50' :
            'border-red-200 bg-red-50'
          } onClose={() => setAlert(null)}>
            {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
            {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
            {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
            <AlertDescription className={
              alert.type === 'success' ? 'text-emerald-800' :
              alert.type === 'warning' ? 'text-amber-800' :
              'text-red-800'
            }>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobDescriptions.map((job) => (
            <Card key={job.id} className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      {job.title}
                    </CardTitle>
                    <p className="text-slate-600">{job.company}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {job.experience_level && (
                      <Badge className={getExperienceLevelColor(job.experience_level)}>
                        {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                      </Badge>
                    )}
                    <span className="text-sm text-slate-500">
                      {format(new Date(job.created_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 flex-grow">
                <div className="text-sm text-slate-700 line-clamp-3">
                  {job.description}
                </div>
                
                {job.location && (
                  <p className="text-sm text-slate-600">📍 {job.location}</p>
                )}
                
                {job.required_skills && job.required_skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Top Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.required_skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.required_skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-4 mt-auto">
                 <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{resumes.length} total candidates</span>
                  </div>
                  
                  <Button
                    onClick={() => analyzeAllCandidates(job)}
                    disabled={processingJobs.has(job.id) || resumes.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {processingJobs.has(job.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {jobDescriptions.length === 0 && !isLoading && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-900 mb-2">No Job Descriptions Yet</h3>
              <p className="text-blue-700 mb-4">
                Create a job description to start analyzing candidates against specific roles.
              </p>
              <Button onClick={() => navigate(createPageUrl("Upload"))}>Create Job Description</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}