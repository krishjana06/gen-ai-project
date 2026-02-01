'use client';

import { useState, FormEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about courses..."
          disabled={disabled}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-dark-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cornell-red focus:border-transparent"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-2 rounded-lg cornell-gradient text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </div>
    </form>
  );
}
