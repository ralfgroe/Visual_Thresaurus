import { POS_COLORS } from '../lib/types';

export default function Legend() {
  const items = [
    { label: 'Noun', color: POS_COLORS.noun },
    { label: 'Verb', color: POS_COLORS.verb },
    { label: 'Adjective', color: POS_COLORS.adjective },
    { label: 'Adverb', color: POS_COLORS.adverb },
  ];

  return (
    <div className="absolute bottom-6 left-6 z-50 animate-fade-in">
      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-600/30 rounded-xl px-4 py-3 shadow-lg">
        <div className="flex gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
