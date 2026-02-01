import { create } from 'zustand';
import { ChatMessage } from '@/types/chat';

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;

  addMessage: (msg: ChatMessage) => void;
  toggleChat: () => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isOpen: false,
  isTyping: false,

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearMessages: () => set({ messages: [] }),
}));
