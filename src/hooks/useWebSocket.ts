'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type WebSocketEvents = {
  onLiveTick?: (payload: unknown) => void;
  onMarketSnapshot?: (payload: unknown) => void;
  onPortfolioUpdate?: (payload: unknown) => void;
  onAlertTriggered?: (payload: unknown) => void;
};

type UseWebSocketOptions = {
  autoConnect?: boolean;
} & WebSocketEvents;

const FALLBACK_API_URL = 'http://localhost:10000/api/v1';

const resolveSocketBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL;
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onLiveTick,
    onMarketSnapshot,
    onPortfolioUpdate,
    onAlertTriggered,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const onLiveTickRef = useRef<WebSocketEvents['onLiveTick']>(onLiveTick);
  const onMarketSnapshotRef = useRef<WebSocketEvents['onMarketSnapshot']>(onMarketSnapshot);
  const onPortfolioUpdateRef = useRef<WebSocketEvents['onPortfolioUpdate']>(onPortfolioUpdate);
  const onAlertTriggeredRef = useRef<WebSocketEvents['onAlertTriggered']>(onAlertTriggered);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  const socketBaseUrl = useMemo(resolveSocketBaseUrl, []);

  useEffect(() => {
    onLiveTickRef.current = onLiveTick;
  }, [onLiveTick]);

  useEffect(() => {
    onMarketSnapshotRef.current = onMarketSnapshot;
  }, [onMarketSnapshot]);

  useEffect(() => {
    onPortfolioUpdateRef.current = onPortfolioUpdate;
  }, [onPortfolioUpdate]);

  useEffect(() => {
    onAlertTriggeredRef.current = onAlertTriggered;
  }, [onAlertTriggered]);

  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    const socket = io(socketBaseUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id || null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Support both documented and backend-emitted event names.
    socket.on('stock:tick', (payload) => onLiveTickRef.current?.(payload));
    socket.on('live-tick', (payload) => onLiveTickRef.current?.(payload));

    socket.on('market:snapshot', (payload) => onMarketSnapshotRef.current?.(payload));
    socket.on('market-snapshot', (payload) => onMarketSnapshotRef.current?.(payload));

    socket.on('portfolio:update', (payload) => onPortfolioUpdateRef.current?.(payload));
    socket.on('portfolio-update', (payload) => onPortfolioUpdateRef.current?.(payload));

    socket.on('alert:triggered', (payload) => onAlertTriggeredRef.current?.(payload));
    socket.on('alert-triggered', (payload) => onAlertTriggeredRef.current?.(payload));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setSocketId(null);
    };
  }, [autoConnect, socketBaseUrl]);

  const connect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  const subscribeMarketOverview = useCallback(() => {
    socketRef.current?.emit('market:subscribe-overview');
  }, []);

  const unsubscribeMarketOverview = useCallback(() => {
    socketRef.current?.emit('market:unsubscribe-overview');
  }, []);

  const subscribeStock = useCallback((symbol: string) => {
    socketRef.current?.emit('stock:subscribe', symbol);
  }, []);

  const unsubscribeStock = useCallback((symbol: string) => {
    socketRef.current?.emit('stock:unsubscribe', symbol);
  }, []);

  const subscribePortfolio = useCallback((portfolioId: string) => {
    socketRef.current?.emit('portfolio:subscribe', portfolioId);
  }, []);

  const unsubscribePortfolio = useCallback((portfolioId: string) => {
    socketRef.current?.emit('portfolio:unsubscribe', portfolioId);
  }, []);

  const subscribeAlerts = useCallback((userId: string) => {
    socketRef.current?.emit('alerts:subscribe', userId);
  }, []);

  const unsubscribeAlerts = useCallback((userId: string) => {
    socketRef.current?.emit('alerts:unsubscribe', userId);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    socketId,
    connect,
    disconnect,
    subscribeMarketOverview,
    unsubscribeMarketOverview,
    subscribeStock,
    unsubscribeStock,
    subscribePortfolio,
    unsubscribePortfolio,
    subscribeAlerts,
    unsubscribeAlerts,
  };
}
