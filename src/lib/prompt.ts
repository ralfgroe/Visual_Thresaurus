import type { WordNode, WordEdge } from './types';

const SYSTEM_PROMPT = `You are a linguistic expert. When given a word, you analyze its meanings and return related words in a structured JSON format. Always return valid JSON with no additional text.`;

function buildUserPrompt(word: string): string {
  return `Analyze the word "${word}" and return a JSON object with this exact structure:

{
  "word": "${word}",
  "meanings": [
    {
      "partOfSpeech": "noun",
      "definition": "a short definition",
      "relatedWords": [
        { "word": "example", "partOfSpeech": "noun", "relation": "synonym", "definition": "short gloss" }
      ]
    }
  ]
}

Rules:
- Include ALL distinct meanings/senses of the word, each as a separate entry in "meanings"
- For each meaning, include 4-8 related words
- partOfSpeech must be one of: noun, verb, adjective, adverb
- relation must be one of: synonym, antonym, hypernym, hyponym, related
- Keep definitions concise (under 10 words)
- Return 15-30 related words total across all meanings
- Return ONLY the JSON object, no markdown fences or extra text`;
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
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
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
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(word) }],
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

  const parsed = parseClaudeResponse(textBlock.text);
  if (!parsed) throw new Error('Failed to parse word data from response');

  return parsed;
}

export { buildUserPrompt, SYSTEM_PROMPT };
