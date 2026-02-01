'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { useGraphStore } from '@/stores/graphStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { chatAPI } from '@/lib/api';
import { extractCourseCodes } from '@/lib/graphUtils';

export function ChatOverlay() {
  const { messages, isOpen, isTyping, toggleChat, addMessage, setTyping } = useChatStore();
  const { highlightNodes } = useGraphStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    setTyping(true);
    try {
      const response = await chatAPI.sendMessage(content, messages.slice(-5));
      const courseCodes = extractCourseCodes(response);

      const aiMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date(),
        highlightedCourses: courseCodes,
      };
      addMessage(aiMessage);

      if (courseCodes.length > 0) {
        highlightNodes(courseCodes);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      });
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleChat}
            className="cornell-gradient px-6 py-3 rounded-full text-white font-medium hover:opacity-90 transition-all shadow-lg"
          >
            💬 Chat with AI Advisor
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel w-96 h-[600px] rounded-2xl flex flex-col shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="cornell-gradient p-4 flex justify-between items-center">
              <h3 className="font-semibold text-white">Course Advisor</h3>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-dark-500 mt-8">
                  <p className="mb-4">👋 Hi! I&apos;m your course advisor.</p>
                  <p className="text-sm">Try asking:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>&quot;What is CS 4820?&quot;</li>
                    <li>&quot;Recommend easy CS courses&quot;</li>
                    <li>&quot;Tell me about MATH 2940&quot;</li>
                  </ul>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-200 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
