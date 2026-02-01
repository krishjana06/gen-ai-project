'use client';

import { useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { CourseNode } from '@/types/course';
import { getSubjectColor } from '@/lib/colorSchemes';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

interface VectorSphere3DProps {
  course: CourseNode;
  allCourses: CourseNode[];
  onClose: () => void;
}

export function VectorSphere3D({ course, allCourses, onClose }: VectorSphere3DProps) {
  const graphRef = useRef<any>();

  // Create a focused graph showing the selected course and its connections
  const graphData = useMemo(() => {
    // For now, since we don't have real prerequisite data, we'll create
    // connections based on subject similarity and course numbers
    const nodes = [course]; // Start with selected course
    const links: Array<{ source: string; target: string }> = [];

    // Add related courses (same subject, similar level)
    const relatedCourses = allCourses.filter((c) => {
      if (c.id === course.id) return false;

      // Same subject
      if (c.subject === course.subject) {
        const courseLevel = parseInt(course.catalog_number[0]);
        const otherLevel = parseInt(c.catalog_number[0]);

        // Similar level (within 1 level)
        if (Math.abs(courseLevel - otherLevel) <= 1) {
          return true;
        }
      }

      return false;
    });

    // Limit to 15 related courses for performance
    const limitedRelated = relatedCourses.slice(0, 15);
    nodes.push(...limitedRelated);

    // Create links from main course to related courses
    limitedRelated.forEach((related) => {
      links.push({
        source: course.id,
        target: related.id,
      });
    });

    return { nodes, links };
  }, [course, allCourses]);

  // Auto-rotate the camera on mount
  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;

      // Center camera on the main course
      const distance = 400;
      const distRatio = 1 + distance / Math.hypot(course.id.length * 10, 100, 100);

      fg.cameraPosition(
        { x: course.id.length * 10 * distRatio, y: 100 * distRatio, z: 100 * distRatio },
        { x: 0, y: 0, z: 0 },
        1000
      );

      // Slow rotation
      let angle = 0;
      const interval = setInterval(() => {
        angle += 0.005;
        const distance = 300;
        fg.cameraPosition({
          x: distance * Math.sin(angle),
          y: 100,
          z: distance * Math.cos(angle),
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [course]);

  const getNodeColor = (node: CourseNode) => {
    // Main course gets bright yellow
    if (node.id === course.id) {
      return '#FFEB3B';
    }
    // Related courses get subject color
    return getSubjectColor(node.subject);
  };

  const getNodeSize = (node: CourseNode) => {
    // Main course is larger
    if (node.id === course.id) {
      return 15;
    }
    return 8;
  };

  const getNodeLabel = (node: CourseNode) => {
    return `
      <div style="background: rgba(0, 0, 0, 0.9); padding: 10px; border-radius: 6px; color: white; font-family: sans-serif; max-width: 250px;">
        <strong style="font-size: 14px;">${node.id}</strong><br/>
        <span style="font-size: 12px;">${node.title}</span>
      </div>
    `;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full max-w-6xl max-h-[90vh] m-8"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 glass-panel rounded-t-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {course.id} - Vector Connections
              </h2>
              <p className="text-gray-300 text-sm">{course.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-4xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="w-full h-full glass-panel rounded-2xl overflow-hidden">
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={getNodeLabel}
            nodeColor={getNodeColor}
            nodeVal={getNodeSize}
            nodeOpacity={0.9}
            nodeRelSize={1}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            linkColor={() => 'rgba(66, 165, 245, 0.4)'}
            linkWidth={2}
            backgroundColor="#0A1929"
            enableNavigationControls={true}
            showNavInfo={false}
          />
        </div>

        {/* Info Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 glass-panel rounded-b-2xl p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FFEB3B]" />
                <span>Selected Course</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1976D2]" />
                <span>CS Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00ACC1]" />
                <span>MATH Courses</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              Showing {graphData.nodes.length - 1} related courses
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
