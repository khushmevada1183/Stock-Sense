'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
    [watchlists, selectedWatchlistId]
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
    return <div className="container mx-auto px-4 py-10 text-gray-300">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto bg-gray-900/90 border border-gray-700/50 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Watchlists</h1>
          <p className="text-gray-300 mb-4">Please log in to create and manage watchlists.</p>
          <Link href="/auth/login" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Watchlists</h1>
        <p className="text-gray-400 mt-1">Build focused lists and monitor symbols in one place.</p>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-red-300 text-sm">{error}</div>
      ) : null}

      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Create Watchlist</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Watchlist name"
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-3 py-2">
            Create
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-3">All Watchlists</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading watchlists...</p>
          ) : watchlists.length === 0 ? (
            <p className="text-gray-400 text-sm">No watchlists yet.</p>
          ) : (
            <div className="space-y-2">
              {watchlists.map((watchlist) => (
                <button
                  key={watchlist.id}
                  onClick={() => setSelectedWatchlistId(watchlist.id)}
                  className={`w-full text-left border rounded-lg p-3 ${
                    selectedWatchlistId === watchlist.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800/60'
                  }`}
                >
                  <p className="text-white font-medium text-sm">{watchlist.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{watchlist.description || 'No description'}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-3">Watchlist Details</h2>

          {!selectedWatchlist ? (
            <p className="text-gray-400 text-sm">Select a watchlist to manage items.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2">
                  <button onClick={() => void handleRename()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-3 py-2">
                    Save
                  </button>
                  <button
                    onClick={() => void handleDeleteWatchlist(selectedWatchlist.id)}
                    className="flex-1 bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-md px-3 py-2"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddItem} className="flex gap-2">
                <input
                  value={symbolToAdd}
                  onChange={(e) => setSymbolToAdd(e.target.value)}
                  placeholder="Add symbol (e.g., INFY)"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-md px-3 py-2">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => void handleReverseOrder()}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md px-3 py-2"
                >
                  Reverse Order
                </button>
              </form>

              <div className="space-y-2">
                {Array.isArray(selectedWatchlist.items) && selectedWatchlist.items.length > 0 ? (
                  selectedWatchlist.items.map((item) => (
                    <div key={item.id} className="border border-gray-700 bg-gray-800/60 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{item.symbol}</p>
                        <p className="text-xs text-gray-400">{item.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteItem(item.id)}
                        className="text-xs px-2 py-1 rounded border border-red-700 bg-red-900/30 text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No items in this watchlist yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
