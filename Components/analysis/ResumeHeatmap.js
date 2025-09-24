import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ResumeHeatmap({ resumeText, debiasedText, heatmapData }) {
  const getHeatmapColor = (score) => {
    if (score > 85) return 'bg-emerald-200/80';
    if (score > 70) return 'bg-emerald-100/70';
    if (score > 50) return 'bg-amber-100/70';
    if (score > 30) return 'bg-amber-50/60';
    return 'bg-transparent';
  };
  
  const renderTextWithHeatmap = (text, data) => {
    if (!data || data.length === 0) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    let lastIndex = 0;
    const parts = [];

    data.forEach((item, index) => {
      const snippetIndex = text.indexOf(item.snippet, lastIndex);
      if (snippetIndex !== -1) {
        // Add text before the snippet
        if (snippetIndex > lastIndex) {
          parts.push(<span key={`pre-${index}`}>{text.substring(lastIndex, snippetIndex)}</span>);
        }
        // Add the highlighted snippet
        parts.push(
          <TooltipProvider key={`item-${index}`} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`p-0.5 rounded-md transition-colors duration-300 cursor-pointer ${getHeatmapColor(item.score)}`}
                >
                  {item.snippet}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="font-bold">Relevance: {item.score}%</p>
                <p>{item.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
        lastIndex = snippetIndex + item.snippet.length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="post-last">{text.substring(lastIndex)}</span>);
    }
    
    return <p className="whitespace-pre-wrap leading-relaxed">{parts}</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="heatmap">
          <TabsList className="mb-4">
            <TabsTrigger value="heatmap">Relevance Heatmap</TabsTrigger>
            <TabsTrigger value="debiased">De-Biased View</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
          </TabsList>
          <div className="p-4 border rounded-lg max-h-96 overflow-y-auto bg-slate-50/50">
            <TabsContent value="heatmap">
              {renderTextWithHeatmap(resumeText, heatmapData)}
            </TabsContent>
            <TabsContent value="debiased">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{debiasedText || 'De-biased version not available.'}</p>
            </TabsContent>
            <TabsContent value="raw">
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{resumeText}</p>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}