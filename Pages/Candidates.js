import React, { useState, useEffect, useCallback } from "react";
import { Resume, Analysis, JobDescription } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Filter, Eye, Download, Loader2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });
  const [filterByJob, setFilterByJob] = useState('all');
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [candidatesData, analysesData, jobsData] = await Promise.all([
        Resume.list('-created_date'),
        Analysis.list('-created_date'),
        JobDescription.list('-created_date')
      ]);
      setCandidates(candidatesData.map(c => ({...c, latestAnalysis: analysesData.find(a => a.resume_id === c.id)})));
      setAnalyses(analysesData);
      setJobDescriptions(jobsData);
    } catch (error) {
      console.error('Error loading candidates data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterAndSortCandidates = useCallback(() => {
    let tempCandidates = [...candidates];

    if (searchTerm) {
      tempCandidates = tempCandidates.filter(c =>
        c.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.extracted_skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterByJob !== 'all') {
      const resumeIdsForJob = new Set(analyses.filter(a => a.job_description_id === filterByJob).map(a => a.resume_id));
      tempCandidates = tempCandidates.filter(c => resumeIdsForJob.has(c.id));
    }

    tempCandidates.sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'overall_score') {
        aValue = a.latestAnalysis?.overall_score || -1;
        bValue = b.latestAnalysis?.overall_score || -1;
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCandidates(tempCandidates);
  }, [candidates, analyses, searchTerm, sortConfig, filterByJob]);
  
  useEffect(() => {
    filterAndSortCandidates();
  }, [filterAndSortCandidates]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">All Candidates</h1>
            <p className="text-slate-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </p>
          </div>
          <Button onClick={() => navigate(createPageUrl("Upload"))}>
            <Users className="w-4 h-4 mr-2" /> Upload New Candidates
          </Button>
        </div>

        <Card className="bg-white shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search name, email, or skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterByJob} onValueChange={setFilterByJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by job..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobDescriptions.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('candidate_name')}>
                      Candidate <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead className="text-center">
                     <Button variant="ghost" onClick={() => handleSort('overall_score')}>
                      Top Score <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                   <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort('created_date')}>
                      Date Added <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{candidate.candidate_name}</div>
                      <div className="text-sm text-slate-500">{candidate.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {candidate.extracted_skills?.slice(0, 4).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                        {candidate.extracted_skills?.length > 4 && <Badge variant="outline" className="text-xs">+{candidate.extracted_skills.length-4}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge className={`${getScoreColor(candidate.latestAnalysis?.overall_score)} font-semibold text-sm`}>
                        {candidate.latestAnalysis ? `${candidate.latestAnalysis.overall_score}%` : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {format(new Date(candidate.created_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => candidate.latestAnalysis && navigate(createPageUrl(`AnalysisDetails?analysisId=${candidate.latestAnalysis.id}`))}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCandidates.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}