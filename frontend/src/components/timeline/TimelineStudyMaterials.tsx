'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StudyMaterial {
  title: string;
  type: 'video' | 'article' | 'practice' | 'documentation' | 'book';
  url: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

interface CourseStudyMaterials {
  course_code: string;
  course_title: string;
  materials: StudyMaterial[];
}

interface TimelineCourse {
  code: string;
  title: string;
  reason: string;
}

interface TimelineSemester {
  name: string;
  courses: TimelineCourse[];
}

interface TimelineStudyMaterialsProps {
  semesters: TimelineSemester[];
}

export function TimelineStudyMaterials({ semesters }: TimelineStudyMaterialsProps) {
  const [materialsData, setMaterialsData] = useState<Record<string, CourseStudyMaterials>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Extract all unique course codes from the timeline
  const allCourses = semesters.flatMap(semester => semester.courses);
  const uniqueCourses = Array.from(
    new Map(allCourses.map(course => [course.code, course])).values()
  );

  useEffect(() => {
    fetchAllMaterials();
  }, [semesters]);

  const fetchAllMaterials = async () => {
    setLoading(true);
    const materials: Record<string, CourseStudyMaterials> = {};

    // Fetch materials for the first 3 courses (to avoid overwhelming the UI)
    const coursesToFetch = uniqueCourses.slice(0, 6);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    await Promise.all(
      coursesToFetch.map(async (course) => {
        try {
          // Keep the space in course code (backend expects "CS 3110" not "CS3110")
          const response = await fetch(
            `${API_URL}/api/study-materials/${encodeURIComponent(course.code)}`
          );

          if (response.ok) {
            const data = await response.json();
            materials[course.code] = data;
          }
        } catch (error) {
          console.error(`Failed to fetch materials for ${course.code}:`, error);
        }
      })
    );

    setMaterialsData(materials);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'practice':
        return '✏️';
      case 'documentation':
        return '📖';
      case 'book':
        return '📚';
      default:
        return '📌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'article':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'practice':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'documentation':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'book':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-dark-900 mb-4">
          Study Materials for Your Timeline
        </h2>
        <div className="glass-panel rounded-xl p-12 text-center">
          <svg
            className="animate-spin h-8 w-8 text-cornell-red mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-dark-500">Loading study materials for your courses...</p>
        </div>
      </div>
    );
  }

  const coursesWithMaterials = Object.keys(materialsData);

  if (coursesWithMaterials.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark-900 mb-2">
          Study Materials for Your Timeline
        </h2>
        <p className="text-dark-500">
          Curated resources to help you succeed in your courses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coursesWithMaterials.map((courseCode, index) => {
          const courseData = materialsData[courseCode];
          const isExpanded = expandedCourse === courseCode;
          const topMaterials = courseData.materials.slice(0, 3);

          return (
            <motion.div
              key={courseCode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel rounded-xl overflow-hidden"
            >
              {/* Course Header */}
              <div className="bg-cornell-red/5 border-b border-cornell-red/10 p-4">
                <h3 className="font-semibold text-dark-700 mb-1">{courseData.course_code}</h3>
                <p className="text-sm text-dark-500 line-clamp-1">{courseData.course_title}</p>
              </div>

              {/* Top Materials */}
              <div className="p-4 space-y-3">
                {topMaterials.map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getTypeIcon(material.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-dark-700 text-sm mb-1 line-clamp-1 group-hover:text-cornell-red transition-colors">
                          {material.title}
                        </h4>
                        <p className="text-xs text-dark-500 line-clamp-2 mb-2">
                          {material.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(
                              material.type
                            )}`}
                          >
                            {material.type}
                          </span>
                          {material.duration && (
                            <span className="text-xs text-dark-400">{material.duration}</span>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-dark-400 group-hover:text-cornell-red group-hover:translate-x-1 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  </a>
                ))}

                {/* View More Button */}
                {courseData.materials.length > 3 && (
                  <button
                    onClick={() =>
                      setExpandedCourse(isExpanded ? null : courseCode)
                    }
                    className="w-full py-2 text-sm text-cornell-red hover:text-cornell-red-dark font-medium transition-colors"
                  >
                    {isExpanded
                      ? 'Show Less'
                      : `View ${courseData.materials.length - 3} More Resources`}
                  </button>
                )}

                {/* Expanded Materials */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-3 border-t border-gray-200"
                  >
                    {courseData.materials.slice(3).map((material, idx) => (
                      <a
                        key={idx}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getTypeIcon(material.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-dark-700 text-sm mb-1 line-clamp-1 group-hover:text-cornell-red transition-colors">
                              {material.title}
                            </h4>
                            <p className="text-xs text-dark-500 line-clamp-2 mb-2">
                              {material.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(
                                  material.type
                                )}`}
                              >
                                {material.type}
                              </span>
                              {material.duration && (
                                <span className="text-xs text-dark-400">
                                  {material.duration}
                                </span>
                              )}
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-dark-400 group-hover:text-cornell-red group-hover:translate-x-1 transition-all"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-2 text-center">
                <p className="text-xs text-dark-400">
                  {courseData.materials.length} resource
                  {courseData.materials.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 glass-panel rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-cornell-red"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-dark-600">
            Materials are AI-curated based on course content and student reviews
          </p>
        </div>
        <span className="text-xs text-dark-400">
          Showing materials for {coursesWithMaterials.length} courses
        </span>
      </motion.div>
    </div>
  );
}
