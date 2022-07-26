import React, { useEffect, useRef, useState } from 'react'
import { hexToUint8array, uint8ArrayToHex } from '../lib/conv'
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
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [_chatUpdate, setChatUpdate] = useState(false) // Triggers re-rendering when chat updated
    const [text, setText] = useState('')
    const [payload, setPayload] = useState(new Uint8Array())
    const [file, setFile] = useState<File|null>(null)
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        if (!file) {
            return
        }
        const func = async () => {
            const uint8array = new Uint8Array(await file.arrayBuffer())
            setPayload(uint8array)
        }
        func()
    }, [ file ])

    useEffect(() => {
        setPayload(new TextEncoder().encode(text))
    }, [ text ])

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
            const decryptedHex = uint8ArrayToHex(decrypted)
            chats.set(timestamp, decryptedHex)
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

    const send = async () => {
        setIsSending(true)

        try {
            const { iv, cipher } = await encrypt(keypair, otherPubkey, payload)
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
        } finally {
            setIsSending(false)
        }
    }

    return <div>
        <input placeholder='text' value={text} onInput={(e: any) => setText(e.currentTarget.value)}></input>
        <input type='file' onInput={(e: any) => setFile(e.currentTarget.files[0])} ref={fileInputRef}></input>
        <button onClick={() => { send(); setText(''); setFile(null); fileInputRef.current!.value = '' }} disabled={isSending}>送信</button>
        <ul>
            {Array.from(chats.keys()).map(timestamp => {
                const textHex = chats.get(timestamp) ?? ''
                const textUint8array = hexToUint8array(textHex)
                const text = new TextDecoder().decode(textUint8array).slice(0, 100)

                const download = (el: Element) => {
                    const file = new Blob([textUint8array.buffer])
                    const objUrl = URL.createObjectURL(file)
                    el.setAttribute('href', objUrl)
                    // @ts-expect-error
                    el.click()
                    el.remove()
                    setTimeout(() => {
                        URL.revokeObjectURL(objUrl)
                    }, 10 * 1000)
                }

                return <li key={timestamp}>{new Date(timestamp).toUTCString()} <a href='#' download='download' onClick={(e) => download(e.currentTarget)}>↓</a>: {text}</li>
            })}
        </ul>
    </div>
}
