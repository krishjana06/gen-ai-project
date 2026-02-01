'use client';

import { motion } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { PathType } from '@/types/timeline';

const pathConfig: Record<PathType, { icon: string; description: string }> = {
  theorist: {
    icon: '🔬',
    description: 'Math/Research → PhD Track',
  },
  engineer: {
    icon: '⚙️',
    description: 'Systems/Implementation → Industry',
  },
  balanced: {
    icon: '⚖️',
    description: 'Theory + Practice → Versatile',
  },
};

export function TimelineTabs() {
  const { selectedPath, setSelectedPath, timelineData } = useTimelineStore();

  if (!timelineData) return null;

  const paths: PathType[] = ['theorist', 'engineer', 'balanced'];

  return (
    <div className="mb-8">
      {/* Career Analysis Card */}
      {timelineData.analysis && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 mb-6 border-l-4 border-cornell-red"
        >
          <h2 className="text-2xl font-bold text-dark-900 mb-2">
            {timelineData.analysis.career_field}
          </h2>
          <p className="text-dark-500 mb-4">{timelineData.analysis.current_level}</p>
          <div className="flex flex-wrap gap-2">
            {timelineData.analysis.key_skills_needed?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-cornell-red/10 border border-cornell-red/20 rounded-full text-cornell-red text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Path Tabs */}
      <div className="grid grid-cols-3 gap-4">
        {paths.map((pathType) => {
          const config = pathConfig[pathType];
          const pathData = timelineData.paths[pathType];
          const isSelected = selectedPath === pathType;

          return (
            <motion.button
              key={pathType}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPath(pathType)}
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                isSelected ? 'ring-2 ring-cornell-red shadow-lg' : ''
              }`}
            >
              <div
                className={`glass-panel p-6 text-left h-full ${
                  isSelected ? 'border-t-4 border-t-cornell-red' : ''
                }`}
              >
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{config.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-dark-900">
                      {pathData.title}
                    </h3>
                    <p className="text-xs text-dark-500">{config.description}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-dark-600 mb-3 line-clamp-2">
                  {pathData.description}
                </p>

                {/* Target Career */}
                <div className="text-xs text-dark-500">
                  &rarr; {pathData.target_career}
                </div>

                {/* Course Count */}
                <div className="absolute top-4 right-4 bg-cornell-red/10 px-3 py-1 rounded-full">
                  <span className="text-cornell-red text-xs font-semibold">
                    {pathData.semesters.reduce((sum, sem) => sum + sem.courses.length, 0)} courses
                  </span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selectedTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-cornell-red"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
