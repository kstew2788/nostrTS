import WebSocket from 'ws';
import { Event, getSignedEvent } from './event';
import { subscribeToRelay } from './relayManagement';
import { generateSubId } from './keyManagment';  // Import the generateSubId function

export function initializeSocket(relay: string, privKey: string, pubKey: string) {
    const socket = new WebSocket(relay);

    socket.addEventListener('message', (message: WebSocket.MessageEvent) => {
        let data: string;
      
        if (message.data instanceof Buffer) {
          data = message.data.toString('utf8');
        } else if (typeof message.data === 'string') {
          data = message.data;
        } else {
          console.error('Unknown data type:', typeof message.data);
          return;
        }
      
        const [type, subId, event] = JSON.parse(data);
        const { kind, content } = event || {};
        if (!event || event === true) return;
        console.log('message:', event);
        console.log('content:', content);
    });
    
    socket.addEventListener('open', async () => {
      console.log("connected to " + relay);
      const subId = generateSubId();  // Use the generateSubId function to generate subId
      const filter = { "authors": [pubKey] };
      const subscription = ["REQ", subId, filter];
      console.log('Subscription:', subscription);
      socket.send(JSON.stringify(subscription));
    
      const event: Event = {
        "content": "this workshop is awesome!",
        "created_at": Math.floor(Date.now() / 1000),
        "kind": 1,
        "tags": [],
        "pubkey": pubKey,
      };
    
      const signedEvent: Event = await getSignedEvent(event, privKey);
      console.log('signedEvent:', signedEvent);
      socket.send(JSON.stringify(["EVENT", signedEvent]));
    });
}
