import { ECPairInterface, ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';

const tinysecp: TinySecp256k1Interface = require('tiny-secp256k1');
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

export function generateKeyPair(): { privKey: string, pubKey: string } {
  const keyPair: ECPairInterface = ECPair.makeRandom();
  let privKey: string;
  let pubKey: string;

  if (keyPair.privateKey) {
    privKey = keyPair.privateKey.toString('hex');
    pubKey = keyPair.publicKey.toString('hex');
  } else {
    throw new Error('Private key is undefined.');
  }

  return { privKey, pubKey };
}

export function generateSubId(): string {
    const keyPair = ECPair.makeRandom();
    return keyPair.privateKey?.toString("hex").substring(0, 16) || "";
  }
  
