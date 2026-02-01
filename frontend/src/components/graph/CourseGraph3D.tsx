'use client';

import { useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useGraphStore } from '@/stores/graphStore';
import { CourseNode } from '@/types/course';
import { getSubjectColor } from '@/lib/colorSchemes';
import { enhanceGraphForDisplay } from '@/lib/graphUtils';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

export function CourseGraph3D() {
  const { graphData, selectedNode, highlightedNodes, selectNode } = useGraphStore();
  const graphRef = useRef<any>();

  // Enhance graph data for display (add clustering links if no edges)
  const enhancedData = useMemo(() => {
    if (!graphData) return null;
    return enhanceGraphForDisplay(graphData);
  }, [graphData]);

  // Node styling
  const getNodeColor = (node: CourseNode) => {
    // Highlighted nodes get red color
    if (highlightedNodes.has(node.id)) {
      return '#F44336';
    }
    // Selected node gets brighter color
    if (selectedNode?.id === node.id) {
      return '#FFEB3B';
    }
    // Normal color based on subject
    return getSubjectColor(node.subject);
  };

  const getNodeSize = (node: CourseNode) => {
    // Size based on centrality score
    return 4 + (node.centrality * 60);
  };

  const getNodeOpacity = (node: CourseNode) => {
    // Opacity based on enjoyment score
    return 0.6 + (node.enjoyment_score / 10) * 0.4;
  };

  const getNodeLabel = (node: CourseNode) => {
    return `
      <div style="background: rgba(0, 0, 0, 0.8); padding: 8px; border-radius: 4px; color: white; font-family: sans-serif;">
        <strong>${node.id}</strong><br/>
        ${node.title}<br/>
        <hr style="margin: 4px 0; border-color: #555;"/>
        Difficulty: ${node.difficulty_score.toFixed(1)}/10<br/>
        Enjoyment: ${node.enjoyment_score.toFixed(1)}/10<br/>
        Centrality: ${(node.centrality * 100).toFixed(1)}
      </div>
    `;
  };

  // Handle node click
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
        nodeOpacity={getNodeOpacity}
        nodeRelSize={1}
        onNodeClick={handleNodeClick}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
        linkWidth={0.5}
        backgroundColor="#0A1929"
        enableNavigationControls={true}
        showNavInfo={false}
      />
    </div>
  );
}
