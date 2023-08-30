import * as crypto from 'crypto';
import * as tinySecp256k1 from 'tiny-secp256k1';

export interface Event {
  content: string;
  created_at: number;
  kind: number;
  tags: string[];
  pubkey: string;
  id?: string;
  sig?: string;
}

function bufferToHex(buffer: Uint8Array): string {
    return Array.prototype.map.call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
  }  

// Function to get a signed event
export async function getSignedEvent(event: Event, privateKey: string): Promise<Event> {
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
