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

interface StudyMaterialsResponse {
  course_code: string;
  course_title: string;
  materials: StudyMaterial[];
}

interface StudyMaterialCardProps {
  courseCode: string;
  className?: string;
}

export default function StudyMaterialCard({ courseCode, className = '' }: StudyMaterialCardProps) {
  const [materials, setMaterials] = useState<StudyMaterialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchMaterials();
  }, [courseCode]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/api/study-materials/${courseCode}`);

      if (!response.ok) {
        throw new Error('Failed to fetch study materials');
      }

      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'practice':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'documentation':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-50 text-red-600 border-red-200';
      case 'article': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'practice': return 'bg-green-50 text-green-600 border-green-200';
      case 'documentation': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'book': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredMaterials = materials?.materials.filter((material) => {
    const typeMatch = selectedType === 'all' || material.type === selectedType;
    const difficultyMatch = selectedDifficulty === 'all' || material.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  }) || [];

  if (loading) {
    return (
      <div className={`glass-panel rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-cornell-red" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-panel rounded-xl p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMaterials}
            className="mt-3 px-4 py-2 bg-cornell-red text-white rounded-lg hover:bg-cornell-red-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-dark-700 mb-1">Study Materials</h3>
        {materials && (
          <p className="text-sm text-dark-500">
            {materials.course_code} - {materials.course_title}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="article">Articles</option>
            <option value="practice">Practice</option>
            <option value="documentation">Documentation</option>
            <option value="book">Books</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-8 text-dark-400">
          No materials found for the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((material, index) => (
            <motion.a
              key={index}
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="glass-panel rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg border ${getTypeColor(material.type)}`}>
                  {getTypeIcon(material.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-dark-700 mb-1 line-clamp-2">{material.title}</h4>
                  <p className="text-sm text-dark-500 mb-3 line-clamp-2">{material.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                      {material.difficulty}
                    </span>

                    {material.duration && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {material.duration}
                      </span>
                    )}

                    <span className="text-xs text-cornell-red font-medium ml-auto">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
