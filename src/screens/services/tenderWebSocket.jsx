// src/screens/services/tenderWebSocket.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * createTenderWsClient
 *
 * - baseUrl: e.g. "http://10.0.2.2:9090"
 * - companyName: will be sent as STOMP "login" header (like your HTML client)
 * - onPrivateMessage: callback for /user/queue/notifications
 * - onPublicTender: callback for /topic/new-tenders
 */
export const createTenderWsClient = (
  baseUrl,
  companyName,
  onPrivateMessage,
  onPublicTender
) => {
  const socketUrl = `${baseUrl}/ws-tender-updates`;

  console.log('🧩 WebSocket connecting to:', socketUrl, 'for company:', companyName);

  const client = new Client({
    // 1) SockJS factory
    webSocketFactory: () => {
      console.log('WS factory called, creating SockJS:', socketUrl);
      const sock = new SockJS(socketUrl);

      sock.onopen = () => console.log('SockJS onopen fired ✅');
      sock.onclose = (e) => console.log('SockJS onclose fired ❌', e);
      sock.onerror = (e) => console.log('SockJS onerror fired ❌', e);

      return sock;
    },

    // 2) Send same header you use in HTML test client
    connectHeaders: {
      login: companyName || '',
    },

    // 3) Auto-reconnect
    reconnectDelay: 5000,

    // 4) Debug logs
    debug: (str) => {
      console.log('STOMP debug:', str);
    },

    // 5) On successful STOMP CONNECT
    onConnect: (frame) => {
      console.log('✅ STOMP connected. Frame headers:', frame?.headers);

      // PUBLIC /topic/new-tenders
      try {
        client.subscribe('/topic/new-tenders', (message) => {
          const body = message?.body ?? '';
          console.log('📩 PUBLIC /topic/new-tenders =>', body);
          try {
            onPublicTender && onPublicTender(body);
          } catch (cbErr) {
            console.error('Error in onPublicTender callback:', cbErr);
          }
        });
      } catch (err) {
        console.error('Subscription error for /topic/new-tenders:', err);
      }

      // PRIVATE /user/queue/notifications
      try {
        client.subscribe('/user/queue/notifications', (message) => {
          const body = message?.body ?? '';
          console.log('📩 PRIVATE /user/queue/notifications =>', body);
          try {
            onPrivateMessage && onPrivateMessage(body);
          } catch (cbErr) {
            console.error('Error in onPrivateMessage callback:', cbErr);
          }
        });
      } catch (err) {
        console.error('Subscription error for /user/queue/notifications:', err);
      }
    },

    // 6) STOMP-level error
    onStompError: (frame) => {
      console.error(
        '❌ STOMP broker error. message=',
        frame.headers?.message,
        ' body=',
        frame.body
      );
    },

    // 7) WebSocket-level error
    onWebSocketError: (event) => {
      console.error('❌ WebSocket error:', event);
    },
  });

  client.activate();
  return client;
};
