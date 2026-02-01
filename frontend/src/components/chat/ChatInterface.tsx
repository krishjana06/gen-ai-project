'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { timelineAPI } from '@/lib/api';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [completedCourses, setCompletedCourses] = useState('');
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
      setGenerating(true);
      setError(null);

      // Parse completed courses from input or separate field
      const courses = completedCourses
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      // Generate timeline
      const timeline = await timelineAPI.generateTimeline(input, courses);
      setTimelineData(timeline);

    } catch (error: any) {
      console.error('Timeline generation error:', error);
      setError(error.message || 'Failed to generate timeline');
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#132F4C] to-[#0A1929] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Career Compass
          </h1>
          <p className="text-xl text-gray-300">
            Your personalized Cornell CS course planner
          </p>
        </div>

        {/* Main Input Card */}
        <div className="glass-panel rounded-3xl p-8 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Career Goal Input */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                What's your career goal?
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: I want to work at NVIDIA on self-driving cars..."
                className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Completed Courses Input */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Courses you've completed (optional)
              </label>
              <input
                type="text"
                value={completedCourses}
                onChange={(e) => setCompletedCourses(e.target.value)}
                placeholder="CS 2110, MATH 1920, CS 2800"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-400 text-xs mt-1">Separate multiple courses with commas</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {isGenerating && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isGenerating ? 'Generating Your Paths...' : 'Generate My Timeline Paths'}</span>
            </button>
          </form>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-3">
          <p className="text-gray-400 text-sm text-center">Or try one of these:</p>
          <div className="grid grid-cols-1 gap-3">
            {suggestedPrompts.map((prompt, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="glass-panel px-4 py-3 rounded-xl text-left text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Powered by Gemini AI • 158 Cornell CS & Math Courses
        </div>
      </motion.div>
    </div>
  );
}
