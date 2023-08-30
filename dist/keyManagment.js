"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubId = exports.generateKeyPair = void 0;
const ecpair_1 = require("ecpair");
const tinysecp = require('tiny-secp256k1');
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
function generateKeyPair() {
    const keyPair = ECPair.makeRandom();
    let privKey;
    let pubKey;
    if (keyPair.privateKey) {
        privKey = keyPair.privateKey.toString('hex');
        pubKey = keyPair.publicKey.toString('hex');
    }
    else {
        throw new Error('Private key is undefined.');
    }
    return { privKey, pubKey };
}
exports.generateKeyPair = generateKeyPair;
function generateSubId() {
    var _a;
    const keyPair = ECPair.makeRandom();
    return ((_a = keyPair.privateKey) === null || _a === void 0 ? void 0 : _a.toString("hex").substring(0, 16)) || "";
}
exports.generateSubId = generateSubId;
