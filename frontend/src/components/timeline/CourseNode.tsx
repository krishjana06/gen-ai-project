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

  const isCS = code.startsWith('CS');
  const bgColor = isCS ? '#B31B1B' : '#333333';
  const bgGradient = isCS
    ? 'linear-gradient(135deg, #B31B1B 0%, #8B1515 100%)'
    : 'linear-gradient(135deg, #333333 0%, #222222 100%)';

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
        className="rounded-xl shadow-md border border-black/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
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
