import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, bgGradient }) {
  const isPositiveTrend = trend === 'up';

  return (
    <Card className="relative overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${bgGradient.includes('blue') ? 'text-blue-600' : 
              bgGradient.includes('teal') ? 'text-teal-600' : 
              bgGradient.includes('purple') ? 'text-purple-600' : 'text-amber-600'}`} />
          </div>
        </div>
        
        {trendValue && (
          <div className="flex items-center gap-2">
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositiveTrend ? 'text-emerald-600' : 'text-red-600'}`}>
              {trendValue}
            </span>
            <span className="text-sm text-slate-500">this week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}