import { createRoot } from 'react-dom/client'
import React, { useState } from 'react'
import './index.html'
import './help.html'
import { generateEcdhKeypair } from '../lib/crypto'
import { EstablishRoom } from './EstablishRoom'
import { useOnceEffect } from './useOnceEffect'
import { ValidateOtherPubkey } from './ValidateOtherPubkey'
import { Chat } from './Chat'
import { ErrorBoundary } from './ErrorBoundary'

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
    const [otherPubkeyValidated, setOtherPubkeyValidated] = useState(false)

    useOnceEffect(() => {
        generateEcdhKeypair().then(keypair => {
            console.log('Generated ECDH Keypair.')
            setKeypair(keypair)
        })
    })

    return <div>
        <ErrorBoundary>
            { party === null && <ChooseParty setParty={setParty} /> }
            { party !== null && keypair !== null && !otherPubkeyValidated && <EstablishRoom keypair={keypair} party={party} roomIdState={[roomId, setRoomId]} otherPubkeyState={[otherPubkey, setOtherPubkey]} /> }
            { keypair !== null && otherPubkey !== null && !otherPubkeyValidated && <ValidateOtherPubkey keypair={keypair} otherPubkey={otherPubkey} validatedState={[otherPubkeyValidated, setOtherPubkeyValidated]} /> }
            { keypair !== null && otherPubkey !== null && roomId !== null && party !== null && otherPubkeyValidated && <Chat keypair={keypair} otherPubkey={otherPubkey} roomId={roomId} myParty={party} /> }
        </ErrorBoundary>
    </div>
}

createRoot(document.getElementById('app')!).render(<React.StrictMode><Main /></React.StrictMode>)
