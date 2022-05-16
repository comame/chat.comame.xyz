import { createRoot } from 'react-dom/client'
import React, { useState } from 'react'
import './index.html'
import { generateEcdhKeypair } from '../lib/crypto'
import { EstablishRoom } from './EstablishRoom'
import { useOnceEffect } from './useOnceEffect'
import { useMyPubkey } from './useMyPubkey'
import { usePubkeyFingerprint } from './usePubkeyFingerprint'

const ChooseParty: React.FC<{
    setParty: (arg0: 'A'|'B') => unknown
}> = ({ setParty }) => <div>
    <button onClick={() => { setParty('A') }}>部屋を作る</button>
    <button onClick={() => { setParty('B') }}>部屋に参加する</button>
</div>

function Main() {
    const [keypair, setKeypair] = useState<CryptoKeyPair|null>(null)
    const [party, setParty] = useState<'A'|'B'|null>(null)
    const [roomId, setRoomId] = useState<string|null>(null)
    const [otherPubkey, setOtherPubkey] = useState<string|null>(null)

    const myPubkey = useMyPubkey(keypair)

    useOnceEffect(() => {
        generateEcdhKeypair().then(keypair => {
            console.log('keypair generated')
            setKeypair(keypair)
        })
    })

    return <div>
        <p>Room: {roomId}</p>
        <p>My Fingerprint: {usePubkeyFingerprint(myPubkey)}</p>
        <p>Other Fingerprint: {usePubkeyFingerprint(otherPubkey)}</p>
        { party === null && <ChooseParty setParty={setParty} /> }
        { party !== null && keypair !== null && <EstablishRoom keypair={keypair} party={party} roomIdState={[roomId, setRoomId]} otherPubkeyState={[otherPubkey, setOtherPubkey]} /> }
    </div>
}

createRoot(document.getElementById('app')!).render(<React.StrictMode><Main /></React.StrictMode>)
