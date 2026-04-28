import { useState, useCallback } from 'react';
import { GraphProvider, useGraph, useGraphDispatch } from './hooks/useGraphStore';
import { useClaude } from './hooks/useClaude';
import ForceGraph3DComponent from './components/ForceGraph3D';
import SearchBar from './components/SearchBar';
import ApiKeyModal from './components/ApiKeyModal';
import NodeTooltip from './components/NodeTooltip';
import SettingsPanel from './components/SettingsPanel';
import Legend from './components/Legend';
import EmptyState from './components/EmptyState';
import LoadingOverlay from './components/LoadingOverlay';
import type { WordNode } from './lib/types';

function AppInner() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('vt_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(!apiKey);
  const [hoveredNode, setHoveredNode] = useState<WordNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [currentWord, setCurrentWord] = useState<string>('');

  const graphData = useGraph();
  const dispatch = useGraphDispatch();
  const { explore, loading, error, clearError } = useClaude();

  const handleSaveKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('vt_api_key', key);
    setShowKeyModal(false);
  }, []);

  const handleSearch = useCallback(
    async (word: string) => {
      if (!apiKey) {
        setShowKeyModal(true);
        return;
      }
      clearError();
      setCurrentWord(word);
      await explore(apiKey, word);
    },
    [apiKey, explore, clearError],
  );

  const handleNodeClick = useCallback(
    (word: string) => {
      handleSearch(word);
    },
    [handleSearch],
  );

  const handleNodeHover = useCallback(
    (node: WordNode | null, screenPos: { x: number; y: number } | null) => {
      setHoveredNode(node);
      setHoverPos(screenPos);
    },
    [],
  );

  const handleClearGraph = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, [dispatch]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ForceGraph3DComponent
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
      />

      {graphData.nodes.length === 0 && !loading && <EmptyState />}

      <LoadingOverlay loading={loading} word={currentWord} />

      <SearchBar onSearch={handleSearch} loading={loading} />

      <NodeTooltip node={hoveredNode} position={hoverPos} />

      {graphData.nodes.length > 0 && <Legend />}

      {graphData.nodes.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-600/30 rounded-full px-4 py-1.5 shadow-lg">
            <span className="text-[11px] text-slate-500">
              {graphData.nodes.length} words &middot; {graphData.edges.length} connections
            </span>
          </div>
        </div>
      )}

      <SettingsPanel
        onOpenApiKey={() => setShowKeyModal(true)}
        onClearGraph={handleClearGraph}
        hasNodes={graphData.nodes.length > 0}
      />

      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-red-900/80 backdrop-blur-xl border border-red-700/50 rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 max-w-lg">
            <span className="text-sm text-red-200 line-clamp-2">{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-200 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <ApiKeyModal
        open={showKeyModal}
        onSave={handleSaveKey}
        onClose={() => setShowKeyModal(false)}
        hasExistingKey={!!apiKey}
      />
    </div>
  );
}

export default function App() {
  return (
    <GraphProvider>
      <AppInner />
    </GraphProvider>
  );
}
