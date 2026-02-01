import { create } from 'zustand';
import { TimelineData, PathType } from '@/types/timeline';

interface TimelineStore {
  timelineData: TimelineData | null;
  selectedPath: PathType;
  isGenerating: boolean;
  error: string | null;

  setTimelineData: (data: TimelineData) => void;
  setSelectedPath: (path: PathType) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTimelineStore = create<TimelineStore>((set) => ({
  timelineData: null,
  selectedPath: 'balanced',
  isGenerating: false,
  error: null,

  setTimelineData: (data) => set({ timelineData: data, error: null }),
  setSelectedPath: (path) => set({ selectedPath: path }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error, isGenerating: false }),
  reset: () => set({ timelineData: null, selectedPath: 'balanced', isGenerating: false, error: null }),
}));
