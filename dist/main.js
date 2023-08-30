"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import required modules and interfaces
const ecpair_1 = require("ecpair");
const crypto = __importStar(require("crypto"));
const tinySecp256k1 = __importStar(require("tiny-secp256k1"));
const ws_1 = __importDefault(require("ws"));
// Provide the ECC library that implements the TinySecp256k1Interface
const tinysecp = require('tiny-secp256k1');
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
function bufferToHex(buffer) {
    return Array.prototype.map.call(buffer, (x) => ('00' + x.toString(16)).slice(-2)).join('');
}
// Function to get a signed event
function getSignedEvent(event, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Generate a random key pair
const keyPair = ECPair.makeRandom();
let privKey;
let pubKey;
if (keyPair.privateKey) {
    privKey = keyPair.privateKey.toString('hex');
    pubKey = keyPair.publicKey.toString('hex');
    console.log(`Private Key: ${privKey}`);
    console.log(`Public Key: ${pubKey}`);
}
else {
    console.log('Private key is undefined.');
}
// Initialize WebSocket
const relay = "wss://relay.damus.io";
const socket = new ws_1.default(relay);
socket.addEventListener('message', (message) => {
    let data;
    if (message.data instanceof Buffer) {
        data = message.data.toString('utf8');
    }
    else if (typeof message.data === 'string') {
        data = message.data;
    }
    else {
        console.error('Unknown data type:', typeof message.data);
        return;
    }
    // Now you can use `data` as a string
    const [type, subId, event] = JSON.parse(data);
    const { kind, content } = event || {};
    if (!event || event === true)
        return;
    console.log('message:', event);
    console.log('content:', content);
});
socket.addEventListener('open', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("connected to " + relay);
    const subId = ((_a = ECPair.makeRandom().privateKey) === null || _a === void 0 ? void 0 : _a.toString("hex").substring(0, 16)) || "";
    const filter = { "authors": [pubKey] };
    const subscription = ["REQ", subId, filter];
    console.log('Subscription:', subscription);
    socket.send(JSON.stringify(subscription));
    const event = {
        "content": "this workshop is awesome!",
        "created_at": Math.floor(Date.now() / 1000),
        "kind": 1,
        "tags": [],
        "pubkey": pubKey,
    };
    const signedEvent = yield getSignedEvent(event, privKey);
    console.log('signedEvent:', signedEvent);
    socket.send(JSON.stringify(["EVENT", signedEvent]));
}));
