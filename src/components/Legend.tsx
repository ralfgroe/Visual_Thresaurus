import { POS_COLORS } from '../lib/types';

const items = [
  { label: 'Noun', color: POS_COLORS.noun },
  { label: 'Verb', color: POS_COLORS.verb },
  { label: 'Adjective', color: POS_COLORS.adjective },
  { label: 'Adverb', color: POS_COLORS.adverb },
];

export default function Legend() {
  return (
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
  );
}
