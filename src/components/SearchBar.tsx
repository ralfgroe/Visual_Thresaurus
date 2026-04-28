import { useState, useRef, useEffect } from 'react';

interface Props {
  onSearch: (word: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submit = () => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || loading) return;
    onSearch(trimmed);
    setValue('');
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl shadow-black/40 px-5 py-3 gap-3 min-w-[320px] md:min-w-[420px] transition-all focus-within:border-indigo-500/60 focus-within:shadow-indigo-500/10">
        <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') inputRef.current?.blur();
          }}
          placeholder="Look up a word..."
          className="bg-transparent text-white text-lg placeholder-slate-500 w-full border-none"
        />
        {loading && (
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {!loading && value && (
          <button
            onClick={submit}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium shrink-0 transition-colors"
          >
            Go
          </button>
        )}
        <kbd className="hidden md:inline-block text-[10px] text-slate-500 border border-slate-600 rounded px-1.5 py-0.5 shrink-0">/</kbd>
      </div>
    </div>
  );
}
