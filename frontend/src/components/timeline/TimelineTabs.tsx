'use client';

import { motion } from 'framer-motion';
import { useTimelineStore } from '@/stores/timelineStore';
import { PathType } from '@/types/timeline';

const pathConfig: Record<PathType, { icon: string; color: string; description: string }> = {
  theorist: {
    icon: '🔬',
    color: 'from-purple-600 to-purple-500',
    description: 'Math/Research → PhD Track',
  },
  engineer: {
    icon: '⚙️',
    color: 'from-blue-600 to-blue-500',
    description: 'Systems/Implementation → Industry',
  },
  balanced: {
    icon: '⚖️',
    color: 'from-green-600 to-green-500',
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
          className="glass-panel rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {timelineData.analysis.career_field}
          </h2>
          <p className="text-gray-300 mb-4">{timelineData.analysis.current_level}</p>
          <div className="flex flex-wrap gap-2">
            {timelineData.analysis.key_skills_needed?.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm"
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
                isSelected ? 'ring-4 ring-white/30' : ''
              }`}
            >
              <div
                className={`glass-panel p-6 text-left ${
                  isSelected ? 'bg-gradient-to-br ' + config.color : ''
                }`}
              >
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{config.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {pathData.title}
                    </h3>
                    <p className="text-xs text-gray-300">{config.description}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-200 mb-3 line-clamp-2">
                  {pathData.description}
                </p>

                {/* Target Career */}
                <div className="text-xs text-white/70">
                  → {pathData.target_career}
                </div>

                {/* Course Count */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">
                    {pathData.semesters.reduce((sum, sem) => sum + sem.courses.length, 0)} courses
                  </span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selectedTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white"
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
