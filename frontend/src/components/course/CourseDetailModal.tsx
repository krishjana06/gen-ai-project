'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseNode } from '@/types/course';
import { VectorSphere3D } from './VectorSphere3D';
import { getDifficultyColor } from '@/lib/colorSchemes';

interface CourseDetailModalProps {
  courseCode: string;
  onClose: () => void;
}

export function CourseDetailModal({ courseCode, onClose }: CourseDetailModalProps) {
  const [courseData, setCourseData] = useState<CourseNode | null>(null);
  const [allCourses, setAllCourses] = useState<CourseNode[]>([]);
  const [show3D, setShow3D] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/graph');
        const data = await response.json();

        const course = data.nodes.find((n: CourseNode) => n.id === courseCode);
        setCourseData(course || null);
        setAllCourses(data.nodes);
      } catch (error) {
        console.error('Failed to load course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseCode]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="glass-panel rounded-2xl p-8">
          <div className="text-dark-900">Loading course details...</div>
        </div>
      </motion.div>
    );
  }

  if (!courseData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="glass-panel rounded-2xl p-8">
          <div className="text-dark-900">Course not found</div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-cornell-red/10 border border-cornell-red/20 rounded-full text-cornell-red text-sm font-semibold">
                  {courseData.subject}
                </span>
                <h2 className="text-3xl font-bold text-dark-900">{courseData.id}</h2>
              </div>
              <h3 className="text-xl text-dark-500">{courseData.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-dark-500 hover:text-dark-900 text-4xl leading-none transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-dark-900 mb-2">Description</h4>
            <p className="text-dark-600 text-sm leading-relaxed">{courseData.description}</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Difficulty */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-500">Difficulty</span>
                <span className="text-sm font-semibold text-dark-900">
                  {courseData.difficulty_score.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(courseData.difficulty_score / 10) * 100}%`,
                    backgroundColor: getDifficultyColor(courseData.difficulty_score),
                  }}
                />
              </div>
            </div>

            {/* Enjoyment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-500">Enjoyment</span>
                <span className="text-sm font-semibold text-dark-900">
                  {courseData.enjoyment_score.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${(courseData.enjoyment_score / 10) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-dark-900 mb-2">Prerequisites</h4>
            {courseData.prerequisites && courseData.prerequisites.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {courseData.prerequisites.map((prereq) => {
                  const prereqCourse = allCourses.find(c => c.id === prereq);
                  return (
                    <span key={prereq} className="px-3 py-1 bg-cornell-red/10 border border-cornell-red/20 rounded-full text-cornell-red text-sm font-medium">
                      {prereq}{prereqCourse ? ` – ${prereqCourse.title}` : ''}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-dark-500 italic">None</p>
            )}
          </div>

          {/* Unlocks */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-dark-900 mb-2">Unlocks</h4>
            {courseData.unlocks && courseData.unlocks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {courseData.unlocks.map((unlocked) => {
                  const unlockedCourse = allCourses.find(c => c.id === unlocked);
                  return (
                    <span key={unlocked} className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm font-medium">
                      {unlocked}{unlockedCourse ? ` – ${unlockedCourse.title}` : ''}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-dark-500 italic">None</p>
            )}
          </div>

          {/* View 3D Vector Sphere Button */}
          <button
            onClick={() => setShow3D(true)}
            className="w-full cornell-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🌐</span>
            <span>View 3D Vector Sphere</span>
          </button>

          <p className="text-center text-dark-500 text-xs mt-2">
            Explore connections to related courses in 3D
          </p>
        </motion.div>
      </motion.div>

      {/* 3D Vector Sphere Modal */}
      <AnimatePresence>
        {show3D && (
          <VectorSphere3D
            course={courseData}
            allCourses={allCourses}
            onClose={() => setShow3D(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
