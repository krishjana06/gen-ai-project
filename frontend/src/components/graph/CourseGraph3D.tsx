'use client';

import { useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useGraphStore } from '@/stores/graphStore';
import { CourseNode } from '@/types/course';
import { getSubjectColor } from '@/lib/colorSchemes';
import { enhanceGraphForDisplay } from '@/lib/graphUtils';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

export function CourseGraph3D() {
  const { graphData, selectedNode, highlightedNodes, selectNode } = useGraphStore();
  const graphRef = useRef<any>();

  const enhancedData = useMemo(() => {
    if (!graphData) return null;
    return enhanceGraphForDisplay(graphData);
  }, [graphData]);

  const getNodeColor = (node: any) => {
    const courseNode = node as CourseNode;
    if (highlightedNodes.has(courseNode.id)) {
      return '#D44A3C';
    }
    if (selectedNode?.id === courseNode.id) {
      return '#FFEB3B';
    }
    return getSubjectColor(courseNode.subject);
  };

  const getNodeSize = (node: any) => {
    const courseNode = node as CourseNode;
    return 4 + (courseNode.centrality * 60);
  };

  const getNodeLabel = (node: any) => {
    const courseNode = node as CourseNode;
    return `
      <div style="background: rgba(0, 0, 0, 0.8); padding: 8px; border-radius: 4px; color: white; font-family: sans-serif;">
        <strong>${courseNode.id}</strong><br/>
        ${courseNode.title}<br/>
        <hr style="margin: 4px 0; border-color: #555;"/>
        Difficulty: ${courseNode.difficulty_score.toFixed(1)}/10<br/>
        Enjoyment: ${courseNode.enjoyment_score.toFixed(1)}/10<br/>
        Centrality: ${(courseNode.centrality * 100).toFixed(1)}
      </div>
    `;
  };

  const handleNodeClick = (node: any) => {
    selectNode(node as CourseNode);
  };

  if (!enhancedData) {
    return null;
  }

  return (
    <div className="w-full h-screen">
      <ForceGraph3D
        ref={graphRef}
        graphData={enhancedData}
        nodeLabel={getNodeLabel}
        nodeColor={getNodeColor}
        nodeVal={getNodeSize}
        nodeOpacity={0.9}
        nodeRelSize={1}
        onNodeClick={handleNodeClick}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(179, 27, 27, 0.3)'}
        linkWidth={0.5}
        backgroundColor="#1a1a2e"
        enableNavigationControls={true}
        showNavInfo={false}
      />
    </div>
  );
}
