'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { useRouter } from 'next/navigation';

interface ResumeData {
  skills: string[];
  courses: string[];
  experience_years: number;
  summary: string;
  career_goal: string;
  interests: string[];
  current_level: string;
}

export default function ResumeToTimelineForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    setTimelineData,
    setGenerating: setTimelineGenerating,
    setError: setTimelineError,
  } = useTimelineStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setParsedData(null);
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setParsing(true);
    setError('');

    try {
      // Step 1: Upload and parse resume
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data: ResumeData = await response.json();
      setParsedData(data);
      setParsing(false);

      // Step 2: Automatically generate timeline if we have career goal
      if (data.career_goal) {
        await generateTimeline(data);
      } else {
        setUploading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
      setUploading(false);
      setParsing(false);
    }
  };

  const generateTimeline = async (resumeData: ResumeData) => {
    setGenerating(true);
    setTimelineGenerating(true);

    try {
      // Map academic level to semester
      const semesterMap: Record<string, string> = {
        freshman: 'Freshman Spring',
        sophomore: 'Sophomore Fall',
        junior: 'Junior Fall',
        senior: 'Senior Fall',
        graduate: 'Graduate Fall',
      };

      const currentSemester =
        semesterMap[resumeData.current_level.toLowerCase()] || 'Sophomore Fall';

      // Create career goal text enriched with interests
      let enrichedCareerGoal = resumeData.career_goal;
      if (resumeData.interests && resumeData.interests.length > 0) {
        enrichedCareerGoal += `. Interested in: ${resumeData.interests.join(', ')}`;
      }

      const requestBody = {
        career_goal: enrichedCareerGoal,
        completed_courses: resumeData.courses || [],
        current_semester: currentSemester,
        resume_data: resumeData,
      };

      const response = await fetch('http://localhost:8000/api/plan-timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to generate timeline');
      }

      const timelineData = await response.json();
      setTimelineData(timelineData);

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Navigate to timeline view
      router.push('/');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate timeline';
      setError(errorMsg);
      setTimelineError(errorMsg);
    } finally {
      setGenerating(false);
      setUploading(false);
      setTimelineGenerating(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const currentStep = parsing
    ? 'Analyzing resume... (AI extracting your skills & goals)'
    : generating
    ? 'Generating personalized timeline... (Creating 3 career paths)'
    : uploading
    ? 'Processing...'
    : '';

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-dark-700 mb-3">
          Upload Your Resume
        </h2>
        <p className="text-dark-500 max-w-2xl mx-auto">
          Upload your resume and we'll automatically analyze it to create a personalized
          course timeline tailored to your background and career goals.
        </p>
      </div>

      <div className="glass-panel rounded-xl p-8">
        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        {!file && !parsedData ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-cornell-red transition-colors"
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-dark-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-dark-400">PDF, DOCX, or TXT (max 5MB)</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {/* File Selected */}
            {file && !parsedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="glass-panel rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="h-12 w-12 text-cornell-red"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-dark-700">{file.name}</p>
                        <p className="text-sm text-dark-400">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        onClick={handleRemoveFile}
                        className="text-dark-400 hover:text-cornell-red transition-colors"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUploadAndParse}
                  disabled={uploading}
                  className="w-full cornell-gradient text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {currentStep}
                    </span>
                  ) : (
                    'Generate My Timeline'
                  )}
                </button>
              </motion.div>
            )}

            {/* Parsed Data Display */}
            {parsedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg
                    className="h-6 w-6 text-green-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-green-700 font-medium">
                    Resume analyzed successfully! Generating your personalized timeline...
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Career Goal */}
                  {parsedData.career_goal && (
                    <div className="glass-panel rounded-lg p-4">
                      <h4 className="font-semibold text-dark-700 mb-2">Career Goal</h4>
                      <p className="text-dark-600">{parsedData.career_goal}</p>
                    </div>
                  )}

                  {/* Academic Level */}
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="font-semibold text-dark-700 mb-2">Academic Level</h4>
                    <p className="text-dark-600 capitalize">{parsedData.current_level}</p>
                  </div>
                </div>

                {/* Skills */}
                {parsedData.skills && parsedData.skills.length > 0 && (
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="font-semibold text-dark-700 mb-3">Skills Identified</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-cornell-red/10 border border-cornell-red/20 rounded-full text-cornell-red text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Courses */}
                {parsedData.courses && parsedData.courses.length > 0 && (
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="font-semibold text-dark-700 mb-3">
                      Courses Completed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.courses.map((course, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm font-medium"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {parsedData.interests && parsedData.interests.length > 0 && (
                  <div className="glass-panel rounded-lg p-4">
                    <h4 className="font-semibold text-dark-700 mb-3">Areas of Interest</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-600 text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Info Box */}
        {!file && !parsedData && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-cornell-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-cornell-red font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-dark-700 mb-1">Upload</h4>
              <p className="text-sm text-dark-500">
                Upload your resume in PDF, DOCX, or TXT format
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-cornell-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-cornell-red font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-dark-700 mb-1">Analyze</h4>
              <p className="text-sm text-dark-500">
                AI extracts your skills, courses, and career goals
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-cornell-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-cornell-red font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-dark-700 mb-1">Plan</h4>
              <p className="text-sm text-dark-500">
                Get a personalized course timeline for your goals
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
