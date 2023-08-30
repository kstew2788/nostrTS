"use strict";
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
exports.initializeSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const event_1 = require("./event");
const keyManagment_1 = require("./keyManagment"); // Import the generateSubId function
function initializeSocket(relay, privKey, pubKey) {
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
        const [type, subId, event] = JSON.parse(data);
        const { kind, content } = event || {};
        if (!event || event === true)
            return;
        console.log('message:', event);
        console.log('content:', content);
    });
    socket.addEventListener('open', () => __awaiter(this, void 0, void 0, function* () {
        console.log("connected to " + relay);
        const subId = (0, keyManagment_1.generateSubId)(); // Use the generateSubId function to generate subId
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
        const signedEvent = yield (0, event_1.getSignedEvent)(event, privKey);
        console.log('signedEvent:', signedEvent);
        socket.send(JSON.stringify(["EVENT", signedEvent]));
    }));
}
exports.initializeSocket = initializeSocket;
