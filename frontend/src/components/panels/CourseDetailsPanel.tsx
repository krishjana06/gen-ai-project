'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGraphStore } from '@/stores/graphStore';
import { MetricBar } from './MetricBar';
import { getDifficultyColor, getSubjectColor } from '@/lib/colorSchemes';

export function CourseDetailsPanel() {
  const { selectedNode, selectNode } = useGraphStore();

  if (!selectedNode) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-screen w-96 glass-panel overflow-y-auto z-20"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-1 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: getSubjectColor(selectedNode.subject) }}
                >
                  {selectedNode.subject}
                </span>
                <span className="text-xs text-gray-400">
                  {selectedNode.catalog_number}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedNode.id}</h2>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-2">{selectedNode.title}</p>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-white/10">
          <h3 className="font-semibold text-white mb-2">Description</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{selectedNode.description}</p>
        </div>

        {/* Metrics */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <h3 className="font-semibold text-white mb-3">Student Feedback</h3>
          <MetricBar
            label="Difficulty"
            value={selectedNode.difficulty_score}
            color={getDifficultyColor(selectedNode.difficulty_score)}
          />
          <MetricBar
            label="Enjoyment"
            value={selectedNode.enjoyment_score}
            color={getSubjectColor(selectedNode.subject)}
          />
          {selectedNode.comment_count > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Based on {selectedNode.comment_count} student reviews
            </p>
          )}
          {selectedNode.comment_count === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              No student reviews available (showing neutral scores)
            </p>
          )}
        </div>

        {/* Graph Metrics */}
        <div className="p-6">
          <h3 className="font-semibold text-white mb-3">Graph Metrics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{selectedNode.in_degree}</div>
              <div className="text-xs text-gray-400">Prerequisites</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{selectedNode.out_degree}</div>
              <div className="text-xs text-gray-400">Unlocks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {(selectedNode.centrality * 100).toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Centrality</div>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
