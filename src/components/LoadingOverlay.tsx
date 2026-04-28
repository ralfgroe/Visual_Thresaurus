interface Props {
  loading: boolean;
  word?: string;
}

export default function LoadingOverlay({ loading, word }: Props) {
  if (!loading) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-indigo-500/30 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
        {word && (
          <p className="text-sm text-slate-400">
            Exploring <span className="text-white font-medium">{word}</span>...
          </p>
        )}
      </div>
    </div>
  );
}
