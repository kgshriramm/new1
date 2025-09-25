import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function BreakdownRadarChart({ analysis }) {
  const data = [
    { subject: 'Hard Skills', A: analysis.hard_skills_score, fullMark: 100 },
    { subject: 'Semantic Fit', A: analysis.semantic_fit_score, fullMark: 100 },
    { subject: 'Experience', A: analysis.experience_relevance?.score || 0, fullMark: 100 },
    { subject: 'Projects', A: analysis.projects_impact?.score || 0, fullMark: 100 },
    { subject: 'Education', A: analysis.education_fit?.score || 0, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Score" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}