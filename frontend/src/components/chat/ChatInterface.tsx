'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { timelineAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [completedCourses, setCompletedCourses] = useState('');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { setTimelineData, setGenerating, setError, isGenerating } = useTimelineStore();

  const suggestedPrompts = [
    "I want to work at NVIDIA on self-driving cars. I've taken CS 2110 and MATH 1920.",
    "I want to do research in machine learning. I've completed CS 1110 and MATH 2940.",
    "I'm interested in cybersecurity and systems programming. I've taken CS 2110.",
    "I want to work in computer vision at Meta. I've taken CS 2110 and MATH 2210.",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      // Set local loading state first for immediate button feedback
      setIsButtonLoading(true);

      // Delay to show button animation before page transition
      await new Promise(resolve => setTimeout(resolve, 600));

      // Then set global state which triggers page transition
      setGenerating(true);
      setError(null);

      const courses = completedCourses
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const timeline = await timelineAPI.generateTimeline(input, courses);
      setTimelineData(timeline);

    } catch (error: any) {
      console.error('Timeline generation error:', error);
      setError(error.message || 'Failed to generate timeline');
    } finally {
      setIsButtonLoading(false);
      setGenerating(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Cornell Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img
              src="/cornell-logo.svg"
              alt="Cornell University"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-dark-900 mb-3">
            Career Compass
          </h1>
          <p className="text-lg text-dark-500 mb-4">
            Your personalized Cornell CS course planner
          </p>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-6 py-3 bg-cornell-red/5 border border-cornell-red/20 rounded-full mb-4"
          >
            <p className="text-cornell-red font-medium">
              👋 Welcome! Let's plan your path to success
            </p>
          </motion.div>

          <div className="w-16 h-1 bg-cornell-red mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Resume Upload Option */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Link
            href="/resume"
            className="glass-panel rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cornell-red/10 rounded-lg flex items-center justify-center group-hover:bg-cornell-red/20 transition-colors">
                <svg className="w-6 h-6 text-cornell-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-dark-700 group-hover:text-cornell-red transition-colors">
                  Upload Your Resume Instead
                </h3>
                <p className="text-sm text-dark-500">
                  Let AI analyze your background and generate a personalized timeline automatically
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-dark-400 group-hover:text-cornell-red group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 text-sm text-dark-400">or plan manually</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Main Input Card */}
        <div className="glass-panel rounded-2xl p-8 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Career Goal Input */}
            <div className="mb-4">
              <label className="block text-dark-900 text-sm font-semibold mb-2">
                What&apos;s your career goal?
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: I want to work at NVIDIA on self-driving cars..."
                className="w-full h-32 px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-dark-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-transparent resize-none transition-all shadow-sm"
              />
            </div>

            {/* Completed Courses Input */}
            <div className="mb-6">
              <label className="block text-dark-900 text-sm font-semibold mb-2">
                Courses you&apos;ve completed (optional)
              </label>
              <input
                type="text"
                value={completedCourses}
                onChange={(e) => setCompletedCourses(e.target.value)}
                placeholder="CS 2110, MATH 1920, CS 2800"
                className="w-full px-4 py-3 bg-white/60 border border-gray-200/80 rounded-xl text-dark-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-transparent transition-all shadow-sm"
              />
              <p className="text-dark-500 text-xs mt-1">Separate multiple courses with commas</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim() || isButtonLoading}
              className="w-full cornell-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-3 relative overflow-hidden"
            >
              {isButtonLoading && (
                <>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Bouncing dots */}
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </>
              )}
              <span className={isButtonLoading ? 'animate-pulse' : ''}>
                {isButtonLoading ? 'Generating Your Paths...' : 'Generate My Timeline Paths'}
              </span>
            </button>
          </form>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-3">
          <p className="text-dark-500 text-sm text-center">Or try one of these:</p>
          <div className="grid grid-cols-1 gap-3">
            {suggestedPrompts.map((prompt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="glass-panel px-4 py-3 rounded-xl text-left text-dark-600 hover:text-cornell-red hover:border-cornell-red/30 transition-all text-sm"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-dark-500 text-sm">
          Powered by OpenAI &middot; 158 Cornell CS & Math Courses
        </div>
      </motion.div>
    </div>
  );
}
