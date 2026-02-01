'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TimelineView } from '@/components/timeline/TimelineView';

export default function HomePage() {
  const { timelineData, isGenerating, error } = useTimelineStore();

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-[#0A1929] via-[#132F4C] to-[#0A1929]">
      <AnimatePresence>
        {/* Loading State */}
        {isGenerating && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0A1929] via-[#132F4C] to-[#0A1929]"
          >
            <div className="glass-panel rounded-3xl p-12 text-center">
              <div className="text-white text-2xl mb-6">Generating Your Career Paths...</div>
              <div className="flex gap-3 justify-center mb-6">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-gray-400 text-sm">
                Analyzing 158 courses to create personalized timelines...
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {!isGenerating && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0A1929] via-[#132F4C] to-[#0A1929]"
          >
            <div className="glass-panel rounded-3xl p-12 text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-2 text-red-400">Error Generating Timeline</h1>
              <p className="text-gray-400 mb-4">{error}</p>
              <p className="text-sm text-gray-500 mb-6">
                Make sure the backend is running at http://localhost:8000
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content: Chat Interface or Timeline View */}
        {!isGenerating && !error && (
          <motion.div
            key={timelineData ? 'timeline' : 'chat'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {timelineData ? <TimelineView /> : <ChatInterface />}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
