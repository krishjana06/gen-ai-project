'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface CourseNodeData {
  code: string;
  title: string;
  reason: string;
  onCourseClick?: (courseCode: string) => void;
}

function CourseNodeComponent({ data }: { data: CourseNodeData }) {
  const { code, title, reason, onCourseClick } = data;

  // Determine color based on subject
  const isCS = code.startsWith('CS');
  const bgColor = isCS ? '#1976D2' : '#00ACC1';
  const bgGradient = isCS
    ? 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'
    : 'linear-gradient(135deg, #00ACC1 0%, #00838F 100%)';

  const handleClick = () => {
    if (onCourseClick) {
      onCourseClick(code);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer group"
      style={{ width: 280 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: bgColor, border: '2px solid white' }}
      />

      <div
        className="rounded-xl shadow-lg border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
        style={{
          background: bgGradient,
        }}
      >
        {/* Header */}
        <div className="px-4 py-2 bg-black/20">
          <div className="font-bold text-white text-lg">{code}</div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 bg-white/10">
          <div className="text-white font-medium text-sm mb-2 line-clamp-2">
            {title}
          </div>
          <div className="text-white/80 text-xs line-clamp-2">
            {reason}
          </div>
        </div>

        {/* Hover indicator */}
        <div className="h-1 bg-white/0 group-hover:bg-white/30 transition-all duration-300" />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: bgColor, border: '2px solid white' }}
      />
    </div>
  );
}

export const CourseNode = memo(CourseNodeComponent);
