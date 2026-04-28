import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../lib/chat';
import { chatWithClaude } from '../lib/chat';

interface Props {
  apiKey: string;
  centerWord: string;
  onSearch: (word: string) => void;
  graphLoading: boolean;
}

function isWordSearch(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.includes('?')) return false;
  if (trimmed.split(/\s+/).length <= 2 && !trimmed.includes(' ')) return true;
  return false;
}

export default function ChatPanel({ apiKey, centerWord, onSearch, graphLoading }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (centerWord) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          content: centerWord,
          timestamp: Date.now(),
          isWordSearch: true,
        },
      ]);
    }
  }, [centerWord]);

  const submit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading || graphLoading) return;

    if (isWordSearch(trimmed)) {
      onSearch(trimmed.toLowerCase());
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const reply = await chatWithClaude(apiKey, centerWord, trimmed, messages);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [input, chatLoading, graphLoading, apiKey, centerWord, messages, onSearch]);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute top-6 left-6 z-50 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-xl px-3 py-2.5 shadow-lg hover:border-slate-500/60 transition-all"
        title="Open chat"
      >
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 bottom-4 z-50 w-80 flex flex-col bg-slate-900/85 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <h2 className="text-sm font-medium text-slate-300">
          {centerWord ? (
            <>Exploring <span className="text-white font-semibold">{centerWord}</span></>
          ) : (
            'Visual Thesaurus 3D'
          )}
        </h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center pt-8">
            <p className="text-xs text-slate-500 leading-relaxed">
              Type a word to explore it, or ask a question about the current word.
            </p>
          </div>
        )}
        {messages.map((msg) => {
          if (msg.role === 'system' && msg.isWordSearch) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[10px] text-slate-600 bg-slate-800/60 rounded-full px-3 py-1">
                  explored <span className="text-slate-400 font-medium">{msg.content}</span>
                </span>
              </div>
            );
          }
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-indigo-600/40 border border-indigo-500/30 rounded-xl rounded-br-sm px-3 py-2 max-w-[85%]">
                  <p className="text-sm text-slate-200 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          }
          if (msg.role === 'assistant') {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl rounded-bl-sm px-3 py-2 max-w-[85%]">
                  <p className="text-sm text-slate-300 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          }
          return null;
        })}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-600/40 rounded-xl px-3 py-2 focus-within:border-indigo-500/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder={centerWord ? `Ask about "${centerWord}" or search a word...` : 'Search a word...'}
            className="bg-transparent text-sm text-white placeholder-slate-500 w-full border-none"
            disabled={!apiKey}
          />
          {(chatLoading || graphLoading) ? (
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
          ) : input.trim() && (
            <button onClick={submit} className="text-indigo-400 hover:text-indigo-300 shrink-0 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 px-1">
          Single word = explore &middot; Sentence = chat
        </p>
      </div>
    </div>
  );
}
