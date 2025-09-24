import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Code, AlertTriangle, CheckCircle } from "lucide-react";

export default function ScoreBreakdown({ analysis }) {
  const scoreCategories = [
    {
      title: "Hard Skills Match",
      score: analysis.hard_skills_score,
      icon: Code,
      color: "bg-blue-500",
      description: "Technical skills and certifications"
    },
    {
      title: "Semantic Fit",
      score: analysis.semantic_fit_score,
      icon: Brain,
      color: "bg-purple-500",
      description: "Experience relevance and context understanding"
    },
    {
      title: "Experience Relevance",
      score: analysis.experience_relevance?.score || 0,
      icon: TrendingUp,
      color: "bg-teal-500",
      description: "Work history alignment"
    },
    {
      title: "Projects Impact",
      score: analysis.projects_impact?.score || 0,
      icon: CheckCircle,
      color: "bg-emerald-500",
      description: "Project relevance and demonstrated impact"
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBiasLevel = (score) => {
    if (score <= 20) return { level: 'Low', color: 'bg-emerald-100 text-emerald-800' };
    if (score <= 50) return { level: 'Medium', color: 'bg-amber-100 text-amber-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  const biasLevel = getBiasLevel(analysis.bias_score || 0);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Overall Match Score</h3>
              <p className="text-slate-600">Comprehensive relevance assessment</p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(analysis.overall_score)}`}>
              {analysis.overall_score}%
            </div>
          </div>
          <Progress value={analysis.overall_score} className="h-3" />
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {scoreCategories.map((category) => (
            <div key={category.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color} bg-opacity-10`}>
                    <category.icon className={`w-4 h-4 ${category.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{category.title}</h4>
                    <p className="text-sm text-slate-500">{category.description}</p>
                  </div>
                </div>
                <span className={`font-semibold text-lg ${getScoreColor(category.score)}`}>
                  {category.score}%
                </span>
              </div>
              <Progress value={category.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bias Assessment */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Bias Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-amber-800 font-medium">Potential Bias Risk</p>
              <p className="text-amber-700 text-sm">Lower scores indicate less bias risk</p>
            </div>
            <Badge className={biasLevel.color}>
              {biasLevel.level} Risk
            </Badge>
          </div>
          
          {analysis.bias_flags && analysis.bias_flags.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-amber-800">Detected Issues:</h5>
              {analysis.bias_flags.map((flag, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800">{flag.type}</p>
                    <p className="text-sm text-amber-700">{flag.description}</p>
                  </div>
                  <Badge variant="outline" className={
                    flag.severity === 'high' ? 'border-red-300 text-red-700' :
                    flag.severity === 'medium' ? 'border-amber-300 text-amber-700' :
                    'border-yellow-300 text-yellow-700'
                  }>
                    {flag.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}