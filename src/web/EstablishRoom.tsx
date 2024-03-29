import React, { useState, useEffect } from "react"
import { exportPublicKey } from "../lib/crypto"
import { fetchApi } from "./fetchApi"
import { reactState } from "./reactState"
import { useOnceEffect } from "./useOnceEffect"

const readableInviteId = (inviteId: string) => {
    return (inviteId.slice(0, 4) + '-' + inviteId.slice(4)).toUpperCase()
}

const revertReadableInviteId = (readableInviteId: string) => {
    return readableInviteId.replace(/-/g, '').toLowerCase()
}

const EstablishRoomForA: typeof EstablishRoom = ({ keypair, roomIdState, otherPubkeyState }) => {
    const [roomId, setRoomId] = roomIdState
    const [otherPubkey, setOtherPubkey] = otherPubkeyState
    const [inviteId, setInviteId] = useState<string|null>(null)

    const getRoomId = async () => {
        const room = await fetchApi('/api/room/create', {})
        if (room.kind === 'errorResponse') {
            throw 'ui:unexpected-api-error'
        }

        if (!room.item.ok) {
            throw 'ui:fail-create-room'
        }

        setRoomId(room.item.roomId)
        setInviteId(room.item.inviteId)
    }

    const setMyPubkey = async () => {
        const pubkey = await exportPublicKey(keypair)

        if (roomId === null) throw 'internal:internalRoomId-not-set'

        const res = await fetchApi('/api/pubkey/set', {
            kind: 'setPubkeyRequest',
            item: {
                roomId: roomId,
                party: 'A',
                pubkey
            }
        })

        if (res.kind === 'errorResponse') {
            throw 'ui:unexpected-api-error'
        }

        if (!res.item.ok) {
            throw 'ui:fail-set-pubkey-a'
        }
    }

    const getOtherPubkey = async () => {
        if (roomId === null) {
            throw 'internal:internalRoomId-not-set'
        }

        const res = await fetchApi('/api/pubkey/get', {
            kind: 'getPubkeyRequest',
            item: {
                roomId: roomId,
                myParty: 'A'
            }
        })

        if (res.kind === 'errorResponse') {
            throw 'ui:unexpected-api-error'
        }

        if (res.item.ok) {
            setOtherPubkey(res.item.pubkey)
        }
    }

    useOnceEffect(() => {
        getRoomId()
    })
    useEffect(() => {
        if (roomId !== null) {
            setMyPubkey()
        }
    }, [roomId])
    useEffect(() => {
        const interval = setInterval(() => {
        if (roomId !== null && otherPubkey === null) {
            getOtherPubkey()
        }
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [roomId])

    return <div>
        <p>招待コード: <code>{inviteId && readableInviteId(inviteId)}</code></p>
    </div>
}

const EstablishRoomForB: typeof EstablishRoom = ({ keypair, roomIdState, otherPubkeyState }) => {
    const [roomId, setRoomId] = roomIdState
    const [_otherPubkey, setOtherPubkey] = otherPubkeyState
    const [inviteId, setInviteId] = useState<string|null>(null)
    const [inviteIdInputValue, setInviteIdInputValue] = useState<string>('')

    const getRoomId = async () => {
        if (inviteId === null) {
            throw 'ui:inviteid-not-set'
        }

        const res = await fetchApi('/api/room/get', {
            kind: 'getRoomRequest',
            item: {
                inviteId: revertReadableInviteId(inviteId)
            }
        })

        if (res.kind === 'errorResponse') {
            throw 'ui:unexpected-api-error'
        }

        if (!res.item.ok) {
            return
        }

        setRoomId(res.item.roomId)
    }

    const getOtherPubkey = async () => {
        if (roomId === null) {
            throw 'ui:internalRoomId-not-set'
        }

        const res = await fetchApi('/api/pubkey/get', {
            kind: 'getPubkeyRequest',
            item: {
                roomId: roomId,
                myParty: 'B'
            }
        })

        if (res.kind === 'errorResponse') {
            throw 'ui:unexpected-api-error'
        }

        if (!res.item.ok) {
            throw 'ui:pubkey-not-found'
        }

        setOtherPubkey(res.item.pubkey)
    }

    const setMyPubkey = async () => {
        const pubkey = await exportPublicKey(keypair)

        if (roomId === null) throw 'internal:internalRoomId-not-set'

        const res = await fetchApi('/api/pubkey/set', {
            kind: 'setPubkeyRequest',
            item: {
                roomId: roomId,
                party: 'B',
                pubkey
            }
        })

        if (res.kind === 'errorResponse') {
            throw 'ui:unexpected-api-error'
        }

        if (!res.item.ok) {
            throw 'ui:fail-set-pubkey-a'
        }
    }

    useEffect(() => {
        if (inviteId !== null) {
            getRoomId()
        }
    }, [inviteId])

    useEffect(() => {
        if (roomId !== null) {
            getOtherPubkey()
        }
    }, [roomId])
    useEffect(() => {
        if (roomId !== null) {
            setMyPubkey()
        }
    }, [roomId])

    return <div>
        <input placeholder='招待コード' onInput={(e) => { setInviteIdInputValue((e.target as any).value) }}></input>
        <button onClick={() => setInviteId(inviteIdInputValue)}>部屋を検索</button>
    </div>
}

export const EstablishRoom: React.FC<{
    party: 'A'|'B',
    keypair: CryptoKeyPair,
    roomIdState: reactState<string|null>
    otherPubkeyState: reactState<string|null>
}> = (props) => {
    return <div>
        { props.party === 'A' && <EstablishRoomForA {...props} /> }
        { props.party === 'B' && <EstablishRoomForB {...props} /> }
    </div>
}
