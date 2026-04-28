export interface WordNode {
  id: string;
  word: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
  definition?: string;
  explored: boolean;
  addedAt: number;
}

export interface WordEdge {
  source: string;
  target: string;
  relation: 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'related';
}

export interface GraphData {
  nodes: WordNode[];
  edges: WordEdge[];
  centerNodeId: string | null;
}

export const POS_COLORS: Record<string, string> = {
  noun: '#4ade80',
  verb: '#f87171',
  adjective: '#facc15',
  adverb: '#60a5fa',
  other: '#a78bfa',
};
