
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResumeUpload({ onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const processFile = useCallback(async (file) => {
    const { UploadFile, ExtractDataFromUploadedFile } = await import('@/integrations/Core');
    const { Resume } = await import('@/entities/Resume');

    // Upload file
    const { file_url } = await UploadFile({ file });

    // Extract resume data
    const extractionResult = await ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          candidate_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          extracted_text: { type: "string" },
          extracted_skills: { 
            type: "array", 
            items: { type: "string" } 
          },
          experience_years: { type: "number" },
          education: {
            type: "array",
            items: {
              type: "object",
              properties: {
                degree: { type: "string" },
                institution: { type: "string" },
                year: { type: "string" },
                gpa: { type: "string" }
              }
            }
          },
          work_experience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                duration: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          projects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                technologies: { type: "array", items: { type: "string" } },
                impact: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (extractionResult.status === "success") {
      const resumeData = {
        ...extractionResult.output,
        file_url,
        extracted_text: extractionResult.output.extracted_text || "Text extraction failed"
      };

      const resume = await Resume.create(resumeData);
      onUploadComplete(resume);
    } else {
      throw new Error(extractionResult.details || "Failed to extract resume data");
    }
  }, [onUploadComplete]);

  const handleFiles = useCallback(async (files) => {
    setIsUploading(true);
    setError(null);

    for (const file of files) {
      try {
        await processFile(file);
      } catch (err) {
        setError(`Error processing ${file.name}: ${err.message}`);
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);
  }, [processFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (files.length === 0) {
      setError("Please upload PDF or image files only");
      return;
    }

    handleFiles(files);
  }, [handleFiles]);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (files.length === 0) {
      setError("Please upload PDF or image files only");
      return;
    }

    handleFiles(files);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Resume
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? "border-blue-400 bg-blue-50" 
              : "border-slate-300 hover:border-slate-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume-upload"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />

          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {isUploading ? "Processing resumes..." : "Upload resume files"}
              </h3>
              <p className="text-slate-600 mb-4">
                Drag and drop resumes here, or click to browse
              </p>
              <p className="text-sm text-slate-500">
                Supports PDF, PNG, JPEG files
              </p>
            </div>

            <Button
              type="button"
              onClick={() => document.getElementById('resume-upload').click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
