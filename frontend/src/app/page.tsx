'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TimelineView } from '@/components/timeline/TimelineView';

export default function HomePage() {
  const { timelineData, isGenerating, error } = useTimelineStore();
  const [showFullscreenLoading, setShowFullscreenLoading] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isGenerating) {
      // Delay showing the fullscreen loading to let button animation be visible
      timeout = setTimeout(() => {
        setShowFullscreenLoading(true);
      }, 800);
    } else {
      setShowFullscreenLoading(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isGenerating]);

  return (
    <main className="relative w-full min-h-screen bg-[#F7F7F7]">
      <AnimatePresence>
        {/* Loading State */}
        {showFullscreenLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen bg-[#F7F7F7]"
          >
            <div className="glass-panel rounded-2xl p-12 text-center">
              <div className="text-dark-900 text-2xl font-semibold mb-6">Generating Your Career Paths...</div>
              <div className="flex gap-3 justify-center mb-6">
                <div className="w-4 h-4 bg-cornell-red rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-cornell-red rounded-full animate-bounce delay-100"></div>
                <div className="w-4 h-4 bg-cornell-red rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-dark-500 text-sm">
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
            className="flex flex-col items-center justify-center h-screen bg-[#F7F7F7]"
          >
            <div className="glass-panel rounded-2xl p-12 text-center max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-2 text-cornell-red">Error Generating Timeline</h1>
              <p className="text-dark-500 mb-4">{error}</p>
              <p className="text-sm text-dark-500 mb-6">
                Make sure the backend is running at http://localhost:8000
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 cornell-gradient text-white rounded-xl hover:opacity-90 transition-opacity font-semibold"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content: Chat Interface or Timeline View */}
        {!showFullscreenLoading && !error && (
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
