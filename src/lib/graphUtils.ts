import type { WordNode, WordEdge, GraphData } from './types';

const MAX_NODES = 150;

function edgeId(e: WordEdge): string {
  const [a, b] = [e.source, e.target].sort();
  return `${a}::${b}::${e.relation}`;
}

export function mergeGraph(
  current: GraphData,
  newNodes: WordNode[],
  newEdges: WordEdge[],
  newCenterId: string,
): GraphData {
  const nodeMap = new Map(current.nodes.map((n) => [n.id, n]));
  for (const n of newNodes) {
    if (!nodeMap.has(n.id)) {
      nodeMap.set(n.id, n);
    }
  }

  if (nodeMap.has(newCenterId)) {
    const existing = nodeMap.get(newCenterId)!;
    nodeMap.set(newCenterId, { ...existing, explored: true });
  }

  const edgeSet = new Set(current.edges.map(edgeId));
  const mergedEdges = [...current.edges];
  for (const e of newEdges) {
    const id = edgeId(e);
    if (!edgeSet.has(id) && nodeMap.has(e.source) && nodeMap.has(e.target)) {
      edgeSet.add(id);
      mergedEdges.push(e);
    }
  }

  let nodes = Array.from(nodeMap.values());

  if (nodes.length > MAX_NODES) {
    const connectedIds = new Set<string>();
    connectedIds.add(newCenterId);
    for (const e of mergedEdges) {
      if (e.source === newCenterId) connectedIds.add(e.target);
      if (e.target === newCenterId) connectedIds.add(e.source);
    }

    nodes.sort((a, b) => {
      if (connectedIds.has(a.id) && !connectedIds.has(b.id)) return -1;
      if (!connectedIds.has(a.id) && connectedIds.has(b.id)) return 1;
      return b.addedAt - a.addedAt;
    });
    nodes = nodes.slice(0, MAX_NODES);
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const finalEdges = mergedEdges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );

  return { nodes, edges: finalEdges, centerNodeId: newCenterId };
}
