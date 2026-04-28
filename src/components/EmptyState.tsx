export default function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-6 opacity-20">
          <svg className="w-20 h-20 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-light text-slate-500 mb-2">Visual Thesaurus 3D</h2>
        <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
          Type a word above to explore its meanings, synonyms, and connections in an interactive 3D space.
        </p>
      </div>
    </div>
  );
}
