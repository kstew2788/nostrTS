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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignedEvent = void 0;
const crypto = __importStar(require("crypto"));
const tinySecp256k1 = __importStar(require("tiny-secp256k1"));
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
exports.getSignedEvent = getSignedEvent;
