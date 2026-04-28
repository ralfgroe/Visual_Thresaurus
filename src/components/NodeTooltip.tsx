import type { WordNode } from '../lib/types';
import { POS_COLORS } from '../lib/types';

interface Props {
  node: WordNode | null;
  position: { x: number; y: number } | null;
}

export default function NodeTooltip({ node, position }: Props) {
  if (!node || !position) return null;

  const color = POS_COLORS[node.partOfSpeech] || POS_COLORS.other;

  return (
    <div
      className="fixed z-[80] pointer-events-none animate-fade-in"
      style={{
        left: position.x + 16,
        top: position.y - 10,
        maxWidth: 280,
      }}
    >
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium text-white text-sm">{node.word}</span>
          <span className="text-xs text-slate-500 italic">{node.partOfSpeech}</span>
        </div>
        {node.definition && (
          <p className="text-xs text-slate-400 leading-relaxed pl-[18px]">{node.definition}</p>
        )}
        {!node.explored && (
          <p className="text-[10px] text-indigo-400 mt-1.5 pl-[18px]">Click to explore</p>
        )}
      </div>
    </div>
  );
}
