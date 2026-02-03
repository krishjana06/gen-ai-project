'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ResumeUploadForm from '@/components/forms/ResumeUploadForm';
import JobMatcher from '@/components/matcher/JobMatcher';
import StudyMaterialCard from '@/components/materials/StudyMaterialCard';

export default function FeaturesPage() {
  const [selectedTab, setSelectedTab] = useState<'resume' | 'job-matcher' | 'materials'>('resume');
  const [selectedCourse, setSelectedCourse] = useState('CS2110');

  const tabs = [
    { id: 'resume', label: 'Resume Upload', icon: '📄' },
    { id: 'job-matcher', label: 'Job Matcher', icon: '🎯' },
    { id: 'materials', label: 'Study Materials', icon: '📚' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-cornell-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-700">Career Compass</h1>
              <p className="text-sm text-dark-500">New Features Demo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-2 mb-8 glass-panel rounded-xl p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === tab.id
                  ? 'cornell-gradient text-white shadow-lg'
                  : 'text-dark-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Resume Upload Tab */}
          {selectedTab === 'resume' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-700 mb-2">Resume Upload & Analysis</h2>
                <p className="text-dark-500">
                  Upload your resume to extract skills, experience, and get personalized course recommendations
                  based on your background.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResumeUploadForm />

                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-dark-700 mb-4">How It Works</h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-cornell-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cornell-red font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-700 mb-1">Upload Resume</h4>
                        <p className="text-sm text-dark-500">
                          Upload your resume in PDF, DOCX, or TXT format (max 5MB).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-cornell-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cornell-red font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-700 mb-1">AI Analysis</h4>
                        <p className="text-sm text-dark-500">
                          Our AI extracts your technical skills, courses taken, and years of experience.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-cornell-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cornell-red font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-700 mb-1">Get Recommendations</h4>
                        <p className="text-sm text-dark-500">
                          Receive personalized course recommendations to fill skill gaps and advance your career.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Features</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Automatic skill extraction</li>
                      <li>✓ Experience level assessment</li>
                      <li>✓ Course completion tracking</li>
                      <li>✓ Privacy-focused (files not stored)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Matcher Tab */}
          {selectedTab === 'job-matcher' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-700 mb-2">Job Description Matcher</h2>
                <p className="text-dark-500">
                  Paste any job description to discover which Cornell courses will prepare you for that role.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <JobMatcher />
                </div>

                <div className="space-y-4">
                  <div className="glass-panel rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-dark-700 mb-4">Quick Tips</h3>

                    <div className="space-y-3 text-sm text-dark-600">
                      <div>
                        <h4 className="font-semibold mb-1">Best Results</h4>
                        <p className="text-dark-500">
                          Include the full job description with requirements, qualifications, and
                          responsibilities.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">Match Score</h4>
                        <p className="text-dark-500">
                          85%+ = Excellent match<br />
                          60-84% = Good match<br />
                          Below 60% = Consider fundamentals
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">Learning Paths</h4>
                        <p className="text-dark-500">
                          Get customized course sequences tailored to your target role.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-dark-700 mb-3">Example Roles</h3>
                    <div className="space-y-2 text-sm">
                      <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        Software Engineer
                      </button>
                      <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        ML Engineer
                      </button>
                      <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        Data Scientist
                      </button>
                      <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        Security Engineer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Materials Tab */}
          {selectedTab === 'materials' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-700 mb-2">Study Materials Library</h2>
                <p className="text-dark-500">
                  Curated learning resources for Cornell CS and Math courses.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Course Selector */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-dark-700 mb-4">Select Course</h3>

                  <div className="space-y-2">
                    {[
                      'CS2110',
                      'CS3110',
                      'CS4780',
                      'CS4820',
                      'CS4410',
                      'CS5430',
                      'MATH2210',
                    ].map((course) => (
                      <button
                        key={course}
                        onClick={() => setSelectedCourse(course)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCourse === course
                            ? 'cornell-gradient text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-dark-600'
                        }`}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Materials Display */}
                <div className="lg:col-span-3">
                  <StudyMaterialCard courseCode={selectedCourse} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-12">
        <div className="glass-panel rounded-xl p-6 text-center">
          <h3 className="font-semibold text-dark-700 mb-2">Ready to Get Started?</h3>
          <p className="text-sm text-dark-500 mb-4">
            These features are now integrated into Career Compass to help you plan your academic journey.
          </p>
          <button className="cornell-gradient text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-shadow">
            Back to Timeline Planner
          </button>
        </div>
      </div>
    </div>
  );
}
