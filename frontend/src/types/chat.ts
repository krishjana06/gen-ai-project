export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  highlightedCourses?: string[];
}

export interface ChatRequest {
  message: string;
  history?: Array<{role: string; content: string}>;
}

export interface ChatResponse {
  response: string;
}
