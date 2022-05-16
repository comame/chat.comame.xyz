import { useState, useEffect } from 'react'
import { exportPublicKey } from '../lib/crypto'

export function useMyPubkey(keypair: CryptoKeyPair|null) {
    const [myPubkey, setMyPubkey] = useState<string|null>(null)

    useEffect(() => {
        (async () => {
            if (keypair == null) return
            setMyPubkey(await exportPublicKey(keypair))
        })()
    }, [keypair])

    return myPubkey
}
