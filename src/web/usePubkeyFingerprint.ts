import { useEffect, useState } from "react";
import { generatePubkeyFingerprint } from "../lib/crypto";

export function usePubkeyFingerprint(pubkey: string|null) {
    const [fingerprint, setFingerprint] = useState<string|null>(null)
    useEffect(() => {
        (async () => {
            if (pubkey === null) return
            setFingerprint(await generatePubkeyFingerprint(pubkey))
        })()
    })
    return fingerprint
}
