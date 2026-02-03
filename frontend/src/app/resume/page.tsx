'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ResumeToTimelineForm from '@/components/forms/ResumeToTimelineForm';
import Link from 'next/link';

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
            <svg className="w-5 h-5 text-cornell-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-dark-600 font-medium">Back to Manual Planning</span>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-cornell-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-700">CourseGraph</h1>
              <p className="text-sm text-dark-500">Resume-Based Timeline Planner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ResumeToTimelineForm />

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-dark-700 text-center mb-8">
            Why Use Resume-Based Planning?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-dark-700 mb-2">Instant Analysis</h4>
              <p className="text-sm text-dark-500">
                No need to manually enter your skills and experience. We extract everything automatically from your resume.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-dark-700 mb-2">Personalized Recommendations</h4>
              <p className="text-sm text-dark-500">
                Get course recommendations tailored to your actual background, not generic suggestions.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-dark-700 mb-2">Career-Aligned Paths</h4>
              <p className="text-sm text-dark-500">
                We identify your career goals and create timelines that align with your professional aspirations.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 glass-panel rounded-xl p-8"
        >
          <h3 className="text-2xl font-bold text-dark-700 mb-6">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-dark-700 mb-2">Is my resume stored or shared?</h4>
              <p className="text-dark-500">
                No. Your resume is processed in memory and immediately deleted after analysis. We only keep the extracted information (skills, courses) to generate your timeline.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-dark-700 mb-2">What file formats are supported?</h4>
              <p className="text-dark-500">
                We support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files up to 5MB in size.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-dark-700 mb-2">What if my resume doesn't have a career objective?</h4>
              <p className="text-dark-500">
                Our AI will infer your career goals based on your experience, projects, and coursework. You can also manually specify your goal after upload if needed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-dark-700 mb-2">Can I still use the manual planning tool?</h4>
              <p className="text-dark-500">
                Absolutely! You can always switch back to the manual planning interface where you type your career goal and completed courses directly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-dark-700 mb-2">How accurate is the course extraction?</h4>
              <p className="text-dark-500">
                We use pattern matching to identify Cornell CS and Math courses. If we miss any, you can add them manually after the initial analysis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Alternative Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <p className="text-dark-500 mb-4">Prefer to plan manually?</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 border-2 border-cornell-red text-cornell-red font-semibold rounded-xl hover:bg-cornell-red hover:text-white transition-colors"
          >
            Use Manual Planning Tool
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
