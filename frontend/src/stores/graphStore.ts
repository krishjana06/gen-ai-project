import { create } from 'zustand';
import { CourseNode, GraphData } from '@/types/course';

interface GraphStore {
  graphData: GraphData | null;
  selectedNode: CourseNode | null;
  highlightedNodes: Set<string>;
  loading: boolean;
  error: string | null;

  setGraphData: (data: GraphData) => void;
  selectNode: (node: CourseNode | null) => void;
  highlightNodes: (ids: string[]) => void;
  clearHighlights: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  graphData: null,
  selectedNode: null,
  highlightedNodes: new Set(),
  loading: true,
  error: null,

  setGraphData: (data) => set({ graphData: data, loading: false }),
  selectNode: (node) => set({ selectedNode: node }),
  highlightNodes: (ids) => set({ highlightedNodes: new Set(ids) }),
  clearHighlights: () => set({ highlightedNodes: new Set() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
