import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, BookOpen } from "lucide-react";

export default function SkillsAnalysis({ analysis }) {
  return (
    <div className="space-y-6">
      {/* Matched Skills */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <CheckCircle className="w-5 h-5" />
            Matched Skills ({analysis.matched_skills?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.matched_skills && analysis.matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.matched_skills.map((skill, index) => (
                <Badge key={index} className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-emerald-700">No matching skills found</p>
          )}
        </CardContent>
      </Card>

      {/* Missing Skills */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            Missing Skills ({analysis.missing_skills?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {analysis.missing_skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="border-red-300 text-red-700">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Recommendations</span>
                </div>
                <p className="text-sm text-red-700">
                  Consider developing these skills through online courses, certifications, or hands-on projects
                  to improve job match potential.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-red-700">All required skills are present</p>
          )}
        </CardContent>
      </Card>

      {/* Inferred Skills */}
      {analysis.inferred_skills && analysis.inferred_skills.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Eye className="w-5 h-5" />
              Inferred Skills ({analysis.inferred_skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm mb-3">
              Skills derived from work experience and project descriptions
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.inferred_skills.map((skill, index) => (
                <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <span className="text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}