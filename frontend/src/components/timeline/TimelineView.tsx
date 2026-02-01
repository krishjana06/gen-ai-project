'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { TimelineTabs } from './TimelineTabs';
import { SubwayTimeline } from './SubwayTimeline';
import { CourseDetailModal } from '@/components/course/CourseDetailModal';

export function TimelineView() {
  const { timelineData, selectedPath, reset } = useTimelineStore();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  if (!timelineData) return null;

  const currentPath = timelineData.paths[selectedPath];

  const handleCourseClick = (courseCode: string) => {
    setSelectedCourse(courseCode);
  };

  const handleNewSearch = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-6">
      {/* Cornell Header Bar */}
      <div className="cornell-gradient rounded-2xl px-8 py-4 mb-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/cornell-logo.svg"
            alt="Cornell"
            className="h-8 w-auto brightness-0 invert"
          />
          <div className="w-px h-8 bg-white/30"></div>
          <span className="text-white font-semibold">Career Compass</span>
        </div>
        <button
          onClick={handleNewSearch}
          className="px-5 py-2 rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all text-sm"
        >
          &larr; New Search
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-dark-900 mb-2">Your Career Paths</h1>
            <p className="text-dark-500">
              Compare 3 different approaches to reach your goal
            </p>
          </motion.div>
        </div>

        {/* Path Selection Tabs */}
        <TimelineTabs />

        {/* Timeline Visualization */}
        <motion.div
          key={selectedPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SubwayTimeline path={currentPath} onCourseClick={handleCourseClick} />
        </motion.div>

        {/* Timeline Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass-panel rounded-xl p-4"
        >
          <div className="flex items-center justify-between text-sm text-dark-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-cornell-red" />
                <span>CS Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-dark-800" />
                <span>MATH Courses</span>
              </div>
            </div>
            <div className="text-xs text-dark-500">
              Click any course to see details and 3D connections
            </div>
          </div>
        </motion.div>

        {/* Study Materials Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Recommended Study Materials</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📚</div>
                <div className="text-dark-500 text-sm">Material cards coming soon</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <CourseDetailModal
            courseCode={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
