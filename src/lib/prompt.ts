import type { WordNode, WordEdge } from './types';

const SYSTEM_PROMPT = `You are a thesaurus API. You ONLY return raw JSON objects. Never use markdown, code fences, or explanations.`;

function buildUserPrompt(word: string): string {
  return `Return a JSON object for the word "${word}" with this structure:
{"word":"${word}","meanings":[{"partOfSpeech":"noun","definition":"brief def","relatedWords":[{"word":"example","partOfSpeech":"noun","relation":"synonym","definition":"brief def"}]}]}

Include 2-3 meanings. 4-5 related words each. partOfSpeech: noun, verb, adjective, or adverb. relation: synonym, antonym, or related. Definitions under 6 words.`;
}

interface ClaudeResponse {
  word: string;
  meanings: Array<{
    partOfSpeech: string;
    definition: string;
    relatedWords: Array<{
      word: string;
      partOfSpeech: string;
      relation: string;
      definition: string;
    }>;
  }>;
}

function normalizePos(pos: string): WordNode['partOfSpeech'] {
  const p = pos.toLowerCase().trim();
  if (p.startsWith('noun')) return 'noun';
  if (p.startsWith('verb')) return 'verb';
  if (p.startsWith('adj')) return 'adjective';
  if (p.startsWith('adv')) return 'adverb';
  return 'other';
}

function makeNodeId(word: string, pos: string): string {
  return `${word.toLowerCase().replace(/\s+/g, '_')}_${pos}`;
}

function makeCenterId(word: string): string {
  return `${word.toLowerCase().replace(/\s+/g, '_')}__center`;
}

export function parseClaudeResponse(
  raw: string,
): { nodes: WordNode[]; edges: WordEdge[]; centerId: string } | null {
  try {
    let jsonStr = raw.trim();

    // Strip markdown fences if present
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    // Try to find a JSON object if there's extra text around it
    if (!jsonStr.startsWith('{')) {
      const braceStart = jsonStr.indexOf('{');
      const braceEnd = jsonStr.lastIndexOf('}');
      if (braceStart !== -1 && braceEnd > braceStart) {
        jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
      }
    }

    const data: ClaudeResponse = JSON.parse(jsonStr);
    const now = Date.now();
    const nodes: WordNode[] = [];
    const edges: WordEdge[] = [];
    const nodeIds = new Set<string>();

    const centerId = makeCenterId(data.word);
    const firstMeaning = data.meanings[0];
    const definitions = data.meanings.map((m) => `(${m.partOfSpeech}) ${m.definition}`).join('; ');

    nodes.push({
      id: centerId,
      word: data.word,
      partOfSpeech: firstMeaning ? normalizePos(firstMeaning.partOfSpeech) : 'other',
      definition: definitions,
      explored: true,
      addedAt: now,
    });
    nodeIds.add(centerId);

    for (const meaning of data.meanings) {
      for (const rw of meaning.relatedWords) {
        const pos = normalizePos(rw.partOfSpeech);
        const nodeId = makeNodeId(rw.word, pos);

        if (!nodeIds.has(nodeId)) {
          nodeIds.add(nodeId);
          nodes.push({
            id: nodeId,
            word: rw.word,
            partOfSpeech: pos,
            definition: rw.definition,
            explored: false,
            addedAt: now,
          });
        }

        const relation = (['synonym', 'antonym', 'hypernym', 'hyponym', 'related'].includes(rw.relation)
          ? rw.relation
          : 'related') as WordEdge['relation'];

        edges.push({
          source: centerId,
          target: nodeId,
          relation,
        });
      }
    }

    return centerId ? { nodes, edges, centerId } : null;
  } catch {
    return null;
  }
}

export async function callClaude(
  apiKey: string,
  word: string,
): Promise<{ nodes: WordNode[]; edges: WordEdge[]; centerId: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(word) },
        { role: 'assistant', content: '{' },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }

  const result = await response.json();
  const textBlock = result.content?.find(
    (b: { type: string }) => b.type === 'text',
  );
  if (!textBlock) throw new Error('No text in response');

  const parsed = parseClaudeResponse('{' + textBlock.text);
  if (!parsed) throw new Error('Failed to parse: ' + textBlock.text.slice(0, 200));

  return parsed;
}

export { buildUserPrompt, SYSTEM_PROMPT };
