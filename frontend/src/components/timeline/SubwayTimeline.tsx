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
  // Convert timeline data to React Flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const semesterSpacing = 400; // Horizontal spacing between semesters
    const courseSpacing = 120; // Vertical spacing between courses

    path.semesters.forEach((semester, semesterIdx) => {
      // Add semester label node
      nodes.push({
        id: `semester-${semesterIdx}`,
        type: 'default',
        data: { label: semester.name },
        position: { x: semesterIdx * semesterSpacing, y: -80 },
        draggable: false,
        style: {
          background: 'rgba(30, 58, 95, 0.8)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });

      // Add course nodes
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

        // Connect to previous semester's courses
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
                stroke: 'rgba(66, 165, 245, 0.4)',
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
    <div className="w-full h-[600px] bg-[#0A1929] rounded-2xl overflow-hidden border border-white/10">
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
        <Background color="#1E3A5F" gap={16} />
        <Controls className="bg-white/10 border-white/20" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'course') return '#1976D2';
            return 'rgba(30, 58, 95, 0.8)';
          }}
          maskColor="rgba(10, 25, 41, 0.6)"
          className="bg-white/10 border-white/20"
        />
      </ReactFlow>
    </div>
  );
}
