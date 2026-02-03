'use client';

import { useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { CourseNode } from '@/types/course';
import { getSubjectColor } from '@/lib/colorSchemes';

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

  const graphData = useMemo(() => {
    const nodes = [course];
    const links: Array<{ source: string; target: string }> = [];

    const relatedCourses = allCourses.filter((c) => {
      if (c.id === course.id) return false;

      if (c.subject === course.subject) {
        const courseLevel = parseInt(course.catalog_number[0]);
        const otherLevel = parseInt(c.catalog_number[0]);

        if (Math.abs(courseLevel - otherLevel) <= 1) {
          return true;
        }
      }

      return false;
    });

    const limitedRelated = relatedCourses.slice(0, 15);
    nodes.push(...limitedRelated);

    limitedRelated.forEach((related) => {
      links.push({
        source: course.id,
        target: related.id,
      });
    });

    return { nodes, links };
  }, [course, allCourses]);

  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;

      const distance = 400;
      const distRatio = 1 + distance / Math.hypot(course.id.length * 10, 100, 100);

      fg.cameraPosition(
        { x: course.id.length * 10 * distRatio, y: 100 * distRatio, z: 100 * distRatio },
        { x: 0, y: 0, z: 0 },
        1000
      );

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
    if (node.id === course.id) {
      return '#FFEB3B';
    }
    return getSubjectColor(node.subject);
  };

  const getNodeSize = (node: CourseNode) => {
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
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm rounded-t-2xl p-6 border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Cornell Logo */}
              <div className="flex-shrink-0">
                <img
                  src="/cornell-logo.svg"
                  alt="Cornell University"
                  className="h-10 w-auto"
                />
              </div>
              <div className="w-px h-10 bg-gray-300"></div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900 mb-1">
                  {course.id} - Vector Connections
                </h2>
                <p className="text-dark-500 text-sm">{course.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-dark-500 hover:text-dark-900 text-4xl leading-none transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* 3D Visualization - keep dark background for 3D legibility */}
        <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
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
            linkColor={() => 'rgba(179, 27, 27, 0.4)'}
            linkWidth={2}
            backgroundColor="#1a1a2e"
            enableNavigationControls={true}
            showNavInfo={false}
          />
        </div>

        {/* Info Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm rounded-b-2xl p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-dark-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FFEB3B]" />
                <span>Selected Course</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#B31B1B]" />
                <span>CS Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#333333]" />
                <span>MATH Courses</span>
              </div>
            </div>
            <div className="text-dark-500 text-xs">
              Showing {graphData.nodes.length - 1} related courses
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
