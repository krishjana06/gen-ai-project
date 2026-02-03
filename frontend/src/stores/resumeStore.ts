import { create } from 'zustand';

interface ResumeData {
  skills: string[];
  courses: string[];
  experience_years: number;
  summary: string;
  raw_text: string;
}

interface ResumeStore {
  resumeData: ResumeData | null;
  isUploading: boolean;
  error: string | null;
  setResumeData: (data: ResumeData) => void;
  setIsUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumeData: null,
  isUploading: false,
  error: null,

  setResumeData: (data) => set({ resumeData: data, error: null }),

  setIsUploading: (uploading) => set({ isUploading: uploading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      resumeData: null,
      isUploading: false,
      error: null,
    }),
}));
