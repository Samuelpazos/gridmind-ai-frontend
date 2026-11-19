import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { getWebSocketUrl } from '../services/api';

export default function useTelemetryStream(enabled, onTelemetry) {
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    if (!enabled) {
      setConnectionState('disconnected');
      return undefined;
    }

    let active = true;
    let refreshTimer;
    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      connectionTimeout: 10000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (!active) return;
        setConnectionState('connected');
        onTelemetry();
        client.subscribe('/topic/telemetry', () => {
          window.clearTimeout(refreshTimer);
          refreshTimer = window.setTimeout(onTelemetry, 300);
        });
      },
      onWebSocketClose: () => {
        if (active) setConnectionState('disconnected');
      },
      onStompError: () => {
        if (active) setConnectionState('disconnected');
      },
      onWebSocketError: () => {
        if (active) setConnectionState('disconnected');
      },
    });

    setConnectionState('connecting');
    client.activate();
    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      void client.deactivate().catch((error) => {
        console.error('No se pudo cerrar el canal de telemetría:', error);
      });
    };
  }, [enabled, onTelemetry]);

  return connectionState;
}
