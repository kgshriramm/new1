import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Target } from "lucide-react";

export default function JobDescriptionForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    required_skills: [],
    preferred_skills: [],
    experience_level: '',
    department: '',
    location: '',
    salary_range: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [skillType, setSkillType] = useState('required');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (!currentSkill.trim()) return;
    
    const skillField = skillType === 'required' ? 'required_skills' : 'preferred_skills';
    setFormData(prev => ({
      ...prev,
      [skillField]: [...prev[skillField], currentSkill.trim()]
    }));
    setCurrentSkill('');
  };

  const removeSkill = (skill, type) => {
    const skillField = type === 'required' ? 'required_skills' : 'preferred_skills';
    setFormData(prev => ({
      ...prev,
      [skillField]: prev[skillField].filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting job description:', error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Create Job Description
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed job description..."
              className="min-h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary_range">Salary Range</Label>
            <Input
              id="salary_range"
              value={formData.salary_range}
              onChange={(e) => handleInputChange('salary_range', e.target.value)}
              placeholder="e.g. $120,000 - $150,000"
            />
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <Label>Skills & Requirements</Label>
            
            <div className="flex gap-2">
              <Select value={skillType} onValueChange={setSkillType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="preferred">Preferred</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add skill..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.required_skills.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-slate-700 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill, index) => (
                    <Badge key={index} className="bg-red-50 text-red-700 border-red-200">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'required')}
                        className="ml-1 hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.preferred_skills.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-slate-700 mb-2">Preferred Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'preferred')}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              'Create Job Description'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}