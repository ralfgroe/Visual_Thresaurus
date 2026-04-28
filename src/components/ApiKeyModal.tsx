import { useState } from 'react';

interface Props {
  open: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  hasExistingKey: boolean;
}

export default function ApiKeyModal({ open, onSave, onClose, hasExistingKey }: Props) {
  const [key, setKey] = useState('');

  if (!open) return null;

  const handleSave = () => {
    const trimmed = key.trim();
    if (trimmed) {
      onSave(trimmed);
      setKey('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-600/50 rounded-2xl shadow-2xl shadow-black/60 p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          {hasExistingKey ? 'Update API Key' : 'Welcome to Visual Thesaurus 3D'}
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {hasExistingKey
            ? 'Enter a new Anthropic API key below.'
            : 'Enter your Anthropic API key to get started. The key is stored locally in your browser and sent only to the Anthropic API.'}
        </p>

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="sk-ant-..."
            className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-indigo-500/60 transition-colors"
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2">
            Get a key at{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          {hasExistingKey && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors rounded-xl"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-colors"
          >
            {hasExistingKey ? 'Update' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}
