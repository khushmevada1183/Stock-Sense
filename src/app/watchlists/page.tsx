'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  addWatchlistItem,
  createWatchlist,
  deleteWatchlist,
  getWatchlistById,
  getWatchlists,
  removeWatchlistItem,
  reorderWatchlistItems,
  updateWatchlist,
} from '@/api/api';
import {
  ToolAuthGate,
  ToolError,
  ToolLoading,
  ToolPageLayout,
  ToolPanel,
  fieldClass,
  primaryButtonClass,
} from '@/components/tools/ToolPageLayout';
import { dangerButtonClass, insetPanelClass, secondaryButtonClass } from '@/styles/design-tokens';

type WatchlistItem = {
  id: string;
  symbol: string;
  createdAt?: string;
};

type Watchlist = {
  id: string;
  name: string;
  description?: string | null;
  items?: WatchlistItem[];
};

export default function WatchlistsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [symbolToAdd, setSymbolToAdd] = useState('');

  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) || null,
    [watchlists, selectedWatchlistId],
  );

  const loadWatchlists = async () => {
    try {
      setLoading(true);
      const response = await getWatchlists();
      const list = Array.isArray(response) ? response : [];
      setWatchlists(list);

      if (list.length > 0 && !selectedWatchlistId) {
        setSelectedWatchlistId(list[0].id);
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlists');
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlistDetails = async (watchlistId: string) => {
    try {
      const response = await getWatchlistById(watchlistId);
      const watchlist = response?.data?.watchlist || response?.watchlist;
      if (!watchlist) {
        return;
      }

      setWatchlists((prev) => prev.map((item) => (item.id === watchlistId ? watchlist : item)));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist details');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    void loadWatchlists();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedWatchlistId) {
      void loadWatchlistDetails(selectedWatchlistId);
    }
  }, [selectedWatchlistId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Watchlist name is required');
      return;
    }

    try {
      await createWatchlist({ name: name.trim(), description: description.trim() || undefined });
      setName('');
      setDescription('');
      await loadWatchlists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create watchlist');
    }
  };

  const handleRename = async () => {
    if (!selectedWatchlist || !name.trim()) {
      return;
    }

    try {
      await updateWatchlist(selectedWatchlist.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      await loadWatchlists();
      await loadWatchlistDetails(selectedWatchlist.id);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update watchlist');
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!window.confirm('Delete this watchlist?')) {
      return;
    }

    try {
      await deleteWatchlist(watchlistId);
      setSelectedWatchlistId(null);
      await loadWatchlists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete watchlist');
    }
  };

  const handleAddItem = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedWatchlistId || !symbolToAdd.trim()) {
      return;
    }

    try {
      await addWatchlistItem(selectedWatchlistId, { symbol: symbolToAdd.trim().toUpperCase() });
      setSymbolToAdd('');
      await loadWatchlistDetails(selectedWatchlistId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add watchlist item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedWatchlistId) {
      return;
    }

    try {
      await removeWatchlistItem(selectedWatchlistId, itemId);
      await loadWatchlistDetails(selectedWatchlistId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove watchlist item');
    }
  };

  const handleReverseOrder = async () => {
    if (!selectedWatchlistId || !selectedWatchlist?.items?.length) {
      return;
    }

    try {
      const itemIds = selectedWatchlist.items.map((item) => item.id).reverse();
      await reorderWatchlistItems(selectedWatchlistId, { itemIds });
      await loadWatchlistDetails(selectedWatchlistId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder watchlist');
    }
  };

  useEffect(() => {
    if (selectedWatchlist) {
      setName(selectedWatchlist.name || '');
      setDescription(selectedWatchlist.description || '');
    }
  }, [selectedWatchlist]);

  if (authLoading) {
    return <ToolLoading message="Loading authentication…" />;
  }

  if (!isAuthenticated) {
    return (
      <ToolAuthGate
        title="Watchlists"
        description="Sign in to create and manage focused symbol lists."
      />
    );
  }

  return (
    <ToolPageLayout
      eyebrow="User tools"
      title="Watchlists"
      description="Build focused lists and monitor symbols in one place."
    >
      {error ? <ToolError message={error} /> : null}

      <ToolPanel title="Create watchlist">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Watchlist name"
            className={fieldClass}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className={fieldClass}
          />
          <button type="submit" className={primaryButtonClass}>
            Create
          </button>
        </form>
      </ToolPanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ToolPanel title="All watchlists" className="lg:col-span-1">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading watchlists…</p>
          ) : watchlists.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No watchlists yet.</p>
          ) : (
            <div className="space-y-2">
              {watchlists.map((watchlist) => (
                <button
                  key={watchlist.id}
                  type="button"
                  onClick={() => setSelectedWatchlistId(watchlist.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedWatchlistId === watchlist.id
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : `${insetPanelClass} hover:border-emerald-400/20`
                  }`}
                >
                  <p className="text-sm font-medium text-slate-950 dark:text-white">{watchlist.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {watchlist.description || 'No description'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ToolPanel>

        <ToolPanel title="Watchlist details" className="lg:col-span-2">
          {!selectedWatchlist ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Select a watchlist to manage items.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={fieldClass}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => void handleRename()} className={`${primaryButtonClass} flex-1`}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteWatchlist(selectedWatchlist.id)}
                    className={`${dangerButtonClass} flex-1 px-4 py-2 text-sm`}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="flex flex-wrap gap-2">
                <input
                  value={symbolToAdd}
                  onChange={(e) => setSymbolToAdd(e.target.value)}
                  placeholder="Add symbol (e.g., INFY)"
                  className={`${fieldClass} min-w-[200px] flex-1`}
                />
                <button type="submit" className={primaryButtonClass}>
                  Add
                </button>
                <button type="button" onClick={() => void handleReverseOrder()} className={secondaryButtonClass}>
                  Reverse order
                </button>
              </form>

              <div className="space-y-2">
                {Array.isArray(selectedWatchlist.items) && selectedWatchlist.items.length > 0 ? (
                  selectedWatchlist.items.map((item) => (
                    <div
                      key={item.id}
                      className={`${insetPanelClass} flex items-center justify-between p-3`}
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-950 dark:text-white">{item.symbol}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.id}</p>
                      </div>
                      <button type="button" onClick={() => void handleDeleteItem(item.id)} className={dangerButtonClass}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No items in this watchlist yet.</p>
                )}
              </div>
            </div>
          )}
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
