import axios from 'axios';
import { GraphData } from '@/types/course';
import { ChatResponse } from '@/types/chat';
import { TimelineData } from '@/types/timeline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const graphAPI = {
  getGraph: async (): Promise<GraphData> => {
    const { data } = await api.get<GraphData>('/api/graph');
    return data;
  },
};

export const chatAPI = {
  sendMessage: async (message: string, history: any[] = []): Promise<string> => {
    const { data } = await api.post<ChatResponse>('/api/chat', { message, history });
    return data.response;
  },
};

export const timelineAPI = {
  generateTimeline: async (
    careerGoal: string,
    completedCourses: string[] = [],
    currentSemester: string = 'Sophomore Fall'
  ): Promise<TimelineData> => {
    const { data } = await api.post<TimelineData>('/api/plan-timeline', {
      career_goal: careerGoal,
      completed_courses: completedCourses,
      current_semester: currentSemester,
    });
    return data;
  },
};
