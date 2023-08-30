"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToRelay = void 0;
const keyManagment_1 = require("./keyManagment");
function subscribeToRelay(relay, pubKey, socket) {
    const subId = (0, keyManagment_1.generateSubId)();
    const filter = { "authors": [pubKey] };
    const subscription = ["REQ", subId, filter];
    socket.send(JSON.stringify(subscription));
    // Logic to track which relay you are getting messages from based on subIds
}
exports.subscribeToRelay = subscribeToRelay;
// Other relay management functions...
