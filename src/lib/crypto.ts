import { hexToUint8array, uint8ArrayToHex } from './conv'

const ecdhKeyParam = { name: 'ecdh', namedCurve: 'P-384' }
const aesParam = { name: 'aes-gcm', length: 256 }

export async function generateEcdhKeypair() {
    return await crypto.subtle.generateKey(ecdhKeyParam, true, [ 'deriveKey' ])
}

export async function exportPublicKey(ecdhKeypair: CryptoKeyPair) {
    const pubkey = await crypto.subtle.exportKey('raw', ecdhKeypair.publicKey)
    return uint8ArrayToHex(new Uint8Array(pubkey))
}

export async function encrypt(ecdhKeypair: CryptoKeyPair, receiverPubkey: string, payload: Uint8Array) {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const importedReceiverPubkey = await crypto.subtle.importKey('raw', hexToUint8array(receiverPubkey), ecdhKeyParam, false, [])
    const sharedKey = await crypto.subtle.deriveKey({ name: 'ecdh', public: importedReceiverPubkey }, ecdhKeypair.privateKey, aesParam, false, [ 'encrypt' ])
    const cipher = await crypto.subtle.encrypt({ name: aesParam.name, iv }, sharedKey, payload)
    return { iv: uint8ArrayToHex(iv), cipher: uint8ArrayToHex(new Uint8Array(cipher)) }
}

export async function decrypt(ecdhKeypair: CryptoKeyPair, senderPubkey: string, iv: string, cipher: string) {
    const importedSenderPubkey = await crypto.subtle.importKey('raw', hexToUint8array(senderPubkey), ecdhKeyParam, false, [])
    const sharedKey = await crypto.subtle.deriveKey({ name: 'ecdh', public: importedSenderPubkey }, ecdhKeypair.privateKey, aesParam, false, [ 'decrypt' ])
    const decrypted = await crypto.subtle.decrypt({ name: aesParam.name, iv: hexToUint8array(iv) }, sharedKey, hexToUint8array(cipher))
    return new Uint8Array(decrypted)
}

export async function generatePubkeyFingerprint(pubkey: string) {
    const digest = await crypto.subtle.digest('SHA-1', hexToUint8array(pubkey))
    const fingerprint = uint8ArrayToHex(new Uint8Array(digest))
    return fingerprint
}
