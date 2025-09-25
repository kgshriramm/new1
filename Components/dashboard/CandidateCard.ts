import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, MapPin, Calendar, Award, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function CandidateCard({ candidate, analysis, onViewDetails }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBiasIndicator = (biasScore) => {
    if (biasScore <= 20) return { color: 'text-emerald-600', text: 'Low Bias Risk' };
    if (biasScore <= 50) return { color: 'text-amber-600', text: 'Medium Bias Risk' };
    return { color: 'text-red-600', text: 'High Bias Risk' };
  };

  const biasIndicator = getBiasIndicator(analysis?.bias_score || 0);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{candidate.candidate_name}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {candidate.email}
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {candidate.phone}
                </div>
              )}
 