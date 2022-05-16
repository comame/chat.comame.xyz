import React from "react"
import { reactState } from "./reactState"
import { useMyPubkey } from "./useMyPubkey"
import { usePubkeyFingerprint } from "./usePubkeyFingerprint"

export const ValidateOtherPubkey: React.FC<{
    keypair: CryptoKeyPair,
    otherPubkey: string,
    validatedState: reactState<boolean>
}> = ({ keypair, otherPubkey, validatedState }) => {
    const [_validated, setValidated] = validatedState

    const myPubkey = useMyPubkey(keypair)
    const myFingerprint = usePubkeyFingerprint(myPubkey)
    const otherFingerprint = usePubkeyFingerprint(otherPubkey)

    return <div>
        <p>自分のフィンガープリント: {myFingerprint}</p>
        <p>相手のフィンガープリント: {otherFingerprint}</p>
        <button onClick={() => {
            setValidated(true)
        }}>相手のフィンガープリントは正しい</button>
    </div>
}
