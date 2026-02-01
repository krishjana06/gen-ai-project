'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TimelinePath } from '@/types/timeline';
import { CourseNode } from './CourseNode';

const nodeTypes = {
  course: CourseNode,
};

interface SubwayTimelineProps {
  path: TimelinePath;
  onCourseClick?: (courseCode: string) => void;
}

export function SubwayTimeline({ path, onCourseClick }: SubwayTimelineProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const semesterSpacing = 400;
    const courseSpacing = 120;

    path.semesters.forEach((semester, semesterIdx) => {
      // Semester label node
      nodes.push({
        id: `semester-${semesterIdx}`,
        type: 'default',
        data: { label: semester.name },
        position: { x: semesterIdx * semesterSpacing, y: -80 },
        draggable: false,
        style: {
          background: '#FFFFFF',
          color: '#222222',
          border: '2px solid #B31B1B',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      });

      // Course nodes
      semester.courses.forEach((course, courseIdx) => {
        const nodeId = `${semesterIdx}-${courseIdx}`;
        nodes.push({
          id: nodeId,
          type: 'course',
          data: {
            code: course.code,
            title: course.title,
            reason: course.reason,
            onCourseClick,
          },
          position: {
            x: semesterIdx * semesterSpacing,
            y: courseIdx * courseSpacing,
          },
          draggable: true,
        });

        // Connect to previous semester
        if (semesterIdx > 0) {
          const prevSemesterCourses = path.semesters[semesterIdx - 1].courses;
          prevSemesterCourses.forEach((_, prevCourseIdx) => {
            edges.push({
              id: `e-${semesterIdx - 1}-${prevCourseIdx}-to-${nodeId}`,
              source: `${semesterIdx - 1}-${prevCourseIdx}`,
              target: nodeId,
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: 'rgba(179, 27, 27, 0.3)',
                strokeWidth: 2,
              },
            });
          });
        }
      });
    });

    return { nodes, edges };
  }, [path, onCourseClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#E5E7EB" gap={16} />
        <Controls className="bg-white border-gray-200" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'course') return '#B31B1B';
            return '#FFFFFF';
          }}
          maskColor="rgba(247, 247, 247, 0.6)"
          className="bg-white border-gray-200"
        />
      </ReactFlow>
    </div>
  );
}
