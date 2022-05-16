import React, { useEffect, useRef, useState } from 'react'
import { decrypt, encrypt } from '../lib/crypto'
import { fetchApi } from './fetchApi'

export const Chat: React.FC<{
    keypair: CryptoKeyPair,
    otherPubkey: string,
    roomId: string,
    myParty: 'A'|'B'
}> = ({ keypair, otherPubkey, roomId, myParty }) => {
    const beforeFecthRef = useRef(0)
    const chats = useRef(new Map<number, string>()).current
    const [_chatUpdate, setChatUpdate] = useState(false)
    const [text, setText] = useState('')

    const fetchChat = async () => {
        const res = await fetchApi('/api/chat/get', {
            kind: 'getChatRequest',
            item: {
                roomId,
                party: myParty === 'A' ? 'B' : 'A'
            }
        })

        beforeFecthRef.current = Date.now()

        if (res.kind === 'errorResponse') {
            throw 'io:unknown-api-error'
        }

        if (!res.item.ok) {
            throw 'io:no-room-found'
        }

        for (const chat of res.item.chats) {
            const timestamp = chat.timestamp
            const iv = chat.iv
            const decrypted = await decrypt(keypair, otherPubkey, iv, chat.payload)
            chats.set(timestamp, new TextDecoder().decode(decrypted))
            setChatUpdate(v => !v)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            fetchChat()
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    const send = async (text: string) => {
        const { iv, cipher } = await encrypt(keypair, otherPubkey, new TextEncoder().encode(text))
        const res = await fetchApi('/api/chat/post', {
            kind: 'postChatRequest',
            item: {
                roomId,
                party: myParty,
                payload: cipher,
                iv
            }
        })

        if (res.kind === 'errorResponse') {
            throw 'io:unknown-api-error'
        }

        if (!res.item.ok) {
            throw 'io:fail-post-chat'
        }
    }

    return <div>
        <input placeholder='text' value={text} onInput={(e: any) => setText(e.target.value)}></input>
        <button onClick={() => { send(text); setText('') }}>送信</button>
        <ul>
            {Array.from(chats.keys()).map(timestamp => {
                const text = chats.get(timestamp)
                return <li key={timestamp}>{new Date(timestamp).toUTCString()} {text}</li>
            })}
        </ul>
    </div>
}
