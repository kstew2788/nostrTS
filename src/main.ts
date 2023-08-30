import { generateKeyPair } from './keyManagment';  // Import the generateKeyPair function
import { initializeSocket } from './websockets';  // Import the initializeSocket function

// Generate a random key pair
const { privKey, pubKey } = generateKeyPair();  // Use destructuring to get privKey and pubKey

console.log(`Private Key: ${privKey}`);
console.log(`Public Key: ${pubKey}`);

// Initialize WebSocket
const relay = "wss://relay.damus.io";
initializeSocket(relay, privKey, pubKey);  // Call the initializeSocket function
