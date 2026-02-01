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
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#132F4C] to-[#0A1929] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Your Career Paths</h1>
            <p className="text-gray-300">
              Compare 3 different approaches to reach your goal
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewSearch}
            className="glass-panel px-6 py-3 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
          >
            ← New Search
          </motion.button>
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
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#1976D2]" />
                <span>CS Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#00ACC1]" />
                <span>MATH Courses</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Click any course to see details and 3D connections
            </div>
          </div>
        </motion.div>

        {/* Study Materials Section (Placeholder) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Recommended Study Materials</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📚</div>
                <div className="text-gray-400 text-sm">Material cards coming soon</div>
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
