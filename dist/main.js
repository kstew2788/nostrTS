"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keyManagment_1 = require("./keyManagment"); // Import the generateKeyPair function
const websockets_1 = require("./websockets"); // Import the initializeSocket function
// Generate a random key pair
const { privKey, pubKey } = (0, keyManagment_1.generateKeyPair)(); // Use destructuring to get privKey and pubKey
console.log(`Private Key: ${privKey}`);
console.log(`Public Key: ${pubKey}`);
// Initialize WebSocket
const relay = "wss://relay.damus.io";
(0, websockets_1.initializeSocket)(relay, privKey, pubKey); // Call the initializeSocket function
