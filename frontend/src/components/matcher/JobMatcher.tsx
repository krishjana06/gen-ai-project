'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface JobMatchResult {
  matched_courses: {
    code: string;
    title: string;
    relevance_score: number;
    reason: string;
  }[];
  recommended_paths: {
    path_name: string;
    courses: string[];
    description: string;
  }[];
  skill_gaps: string[];
  overall_match_score: number;
}

interface JobMatcherProps {
  className?: string;
}

export default function JobMatcher({ className = '' }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${API_URL}/api/match-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description');
      }

      const data = await response.json();
      setMatchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setJobDescription('');
    setMatchResult(null);
    setError('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className={`glass-panel rounded-xl p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-dark-700 mb-2">Job Description Matcher</h3>
        <p className="text-sm text-dark-500">
          Paste a job description to get personalized course recommendations that match the required skills.
        </p>
      </div>

      {/* Job Description Input */}
      <div className="mb-4">
        <label htmlFor="job-description" className="block text-sm font-medium text-dark-600 mb-2">
          Job Description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-transparent resize-none"
          disabled={isAnalyzing}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobDescription.trim()}
          className="flex-1 cornell-gradient text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Job Match'
          )}
        </button>

        {matchResult && (
          <button
            onClick={handleClear}
            className="px-6 py-3 border-2 border-gray-300 text-dark-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Match Results */}
      {matchResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Match Score */}
          <div className={`border rounded-xl p-6 text-center ${getScoreColor(matchResult.overall_match_score)}`}>
            <div className="text-4xl font-bold mb-2">{matchResult.overall_match_score}%</div>
            <div className="text-sm font-medium">Overall Match Score</div>
          </div>

          {/* Matched Courses */}
          {matchResult.matched_courses && matchResult.matched_courses.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <h4 className="font-semibold text-dark-700 mb-4">Recommended Courses</h4>
              <div className="space-y-3">
                {matchResult.matched_courses.map((course, index) => (
                  <div key={index} className="glass-panel rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-dark-700">{course.code}</span>
                        <span className="text-dark-500 ml-2">{course.title}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getRelevanceColor(course.relevance_score)}`}
                            style={{ width: `${course.relevance_score * 100}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm font-medium text-dark-600">
                          {Math.round(course.relevance_score * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-dark-500">{course.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Learning Paths */}
          {matchResult.recommended_paths && matchResult.recommended_paths.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <h4 className="font-semibold text-dark-700 mb-4">Suggested Learning Paths</h4>
              <div className="space-y-3">
                {matchResult.recommended_paths.map((path, index) => (
                  <div key={index} className="glass-panel rounded-lg p-4">
                    <h5 className="font-semibold text-dark-700 mb-2">{path.path_name}</h5>
                    <p className="text-sm text-dark-500 mb-3">{path.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {path.courses.map((courseCode, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-cornell-red/10 border border-cornell-red/20 rounded-full text-cornell-red text-sm font-medium"
                        >
                          {courseCode}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {matchResult.skill_gaps && matchResult.skill_gaps.length > 0 && (
            <div className="glass-panel rounded-xl p-5">
              <h4 className="font-semibold text-dark-700 mb-4">Skills to Develop</h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.skill_gaps.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
