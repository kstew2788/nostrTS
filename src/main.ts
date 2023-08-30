// Import required modules and interfaces
import { ECPairInterface, ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';
import * as crypto from 'crypto';
import * as tinySecp256k1 from 'tiny-secp256k1';
import WebSocket from 'ws';


// Define the Event interface
interface Event {
  content: string;
  created_at: number;
  kind: number;
  tags: string[];
  pubkey: string;
  id?: string;
  sig?: string;
}

// Provide the ECC library that implements the TinySecp256k1Interface
const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

function bufferToHex(buffer: Uint8Array): string {
    return Array.prototype.map.call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
  }  

// Function to get a signed event
async function getSignedEvent(event: Event, privateKey: string): Promise<Event> {
    const eventData = JSON.stringify([
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content
    ]);
    console.log("Serialized Event Data in JS:", eventData);
  
    // Create a SHA-256 hash of the event data
    const hash = crypto.createHash('sha256').update(eventData).digest();
  
    // Use tiny-secp256k1 to sign the hash using Schnorr signatures
    const signature = tinySecp256k1.signSchnorr(hash, Buffer.from(privateKey, 'hex'));
  
    // Update the event object with the id and signature
    event.id = hash.toString('hex');
    event.sig = bufferToHex(signature);
  
    return event;
  }

// Generate a random key pair
const keyPair: ECPairInterface = ECPair.makeRandom();
let privKey: string;
let pubKey: string;

if (keyPair.privateKey) {
  privKey = keyPair.privateKey.toString('hex');
  pubKey = keyPair.publicKey.toString('hex');
  console.log(`Private Key: ${privKey}`);
  console.log(`Public Key: ${pubKey}`);
} else {
  console.log('Private key is undefined.');
}

// Initialize WebSocket
const relay = "wss://relay.damus.io";
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
  
    // Now you can use `data` as a string
  const [type, subId, event] = JSON.parse(data);
  const { kind, content } = event || {};
  if (!event || event === true) return;
  console.log('message:', event);
  console.log('content:', content);
});

socket.addEventListener('open', async () => {
  console.log("connected to " + relay);
  const subId = ECPair.makeRandom().privateKey?.toString("hex").substring(0, 16) || "";
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
