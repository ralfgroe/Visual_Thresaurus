interface Props {
  onQuickstart: () => void;
}

export default function EmptyState({ onQuickstart }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-6 opacity-20">
          <svg className="w-20 h-20 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-light text-slate-500 mb-2">Visual Thesaurus 3D</h2>
        <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed mb-5">
          Type a word above to explore its meanings, synonyms, and connections in an interactive 3D space.
        </p>
        <button
          onClick={onQuickstart}
          className="pointer-events-auto inline-flex items-center gap-2 bg-slate-800/70 backdrop-blur-xl border border-slate-600/40 hover:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-all shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Quick Start Guide
        </button>
      </div>
    </div>
  );
}
