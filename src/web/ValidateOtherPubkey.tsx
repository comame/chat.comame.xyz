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
        <p>相手のフィンガープリントが正しいことを確認してください。異なる場合は、もう一度やり直してください。</p>
        <button onClick={() => {
            setValidated(true)
        }}>続行</button>
    </div>
}
