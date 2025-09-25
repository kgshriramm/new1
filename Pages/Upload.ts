import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { JobDescription } from "@/entities/JobDescription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Upload as UploadIcon } from "lucide-react";

import ResumeUpload from "../components/upload/ResumeUpload";
import JobDescriptionForm from "../components/upload/JobDescriptionForm";

export default function Upload() {
  const navigate = useNavigate();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleResumeUpload = async (resume) => {
    setSuccessMessage(`Resume for ${resume.candidate_name} uploaded successfully!`);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      navigate(createPageUrl("Dashboard"));
    }, 2000);
  };

  const handleJobSubmit = async (jobData) => {
    await JobDescription.create(jobData);
    setSuccessMessage(`Job description for ${jobData.title} created successfully!`);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      navigate(createPageUrl("JobDescriptions"));
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Upload & Create</h1>
          <p className="text-slate-600">
            Add candidate resumes and job descriptions to start AI-powered matching
          </p>
        </div>

        {uploadSuccess && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white shadow-lg border-slate-200">
          <CardContent className="p-6">
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="resume" className="flex items-center gap-2">
                  <UploadIcon className="w-4 h-4" />
                  Upload Resume
                </TabsTrigger>
                <TabsTrigger value="job" className="flex items-center gap-2">
                  <UploadIcon className="w-4 h-4" />
                  Create Job Description
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="resume">
                <ResumeUpload onUploadComplete={handleResumeUpload} />
              </TabsContent>
              
              <TabsContent value="job">
                <JobDescriptionForm onSubmit={handleJobSubmit} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}