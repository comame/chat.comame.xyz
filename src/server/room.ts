import { uint8ArrayToHex } from "../lib/conv"
import { del, get, keys, set } from "../lib/redis"

const roomTtl = 600
const chatTtl = 60

export async function createRoom(): Promise<{ ok: true, roomId: string, inviteId: string } | { ok: false }> {
    const roomId = crypto.randomUUID()
    const inviteId = uint8ArrayToHex(crypto.getRandomValues(new Uint8Array(4)))

    const roomIdCreated = await set(`room:room_id:${inviteId}`, roomId, { expireSec: roomTtl, unique: true })

    return roomIdCreated ? {
        ok: true,
        roomId,
        inviteId
    } : {
        ok: false
    }
}

export async function getRoom(inviteId: string): Promise<{ ok: true, roomId: string } | { ok: false }> {
    const roomId = await get(`room:room_id:${inviteId}`)
    if (roomId === null) {
        return { ok: false }
    } else {
        return { ok: true, roomId }
    }
}

export async function postChat(roomId: string, payload: string, party: 'A'|'B', iv: string) {
    const timestamp = Date.now()
    const setChat = await set(`chat:${roomId}:${party}:${timestamp}`, payload, { expireSec: chatTtl })
    const setIv = await set(`iv:${roomId}:${party}:${timestamp}`, iv, { expireSec: chatTtl })
    return setChat && setIv
}

export async function getChat(roomId: string, party: 'A'|'B') {
    const chatKeys = (await keys(`chat:${roomId}:*`)).filter(key => {
        const keyParty = key.split(':')[3]
        return (keyParty === party)
    })
    return Promise.all(chatKeys.map(async (chatKey) => {
        const key = chatKey.slice('chat.comame.xyz:chat:'.length)
        const payload = await get(`chat:${key}`)
        const iv = await get(`iv:${key}`)
        const party = chatKey.split(':')[3]
        const timestampStr = chatKey.split(':')[4]
        await del(`chat:${key}`)
        await del(`iv:${key}`)
        return {
            party: party as 'A'|'B',
            payload: payload as string,
            timestamp: Number.parseInt(timestampStr, 10),
            iv: iv as string
        }
    }))
}

export async function setPubkey(roomId: string, party: 'A'|'B', pubkey: string): Promise<boolean> {
    return set(`pubkey:${roomId}:${party}`, pubkey, { expireSec: roomTtl, unique: true })
}

export async function getPubkey(roomId: string, myParty: 'A'|'B'): Promise<string|null> {
    const otherParty = myParty == 'A' ? 'B' : 'A'
    return get(`pubkey:${roomId}:${otherParty}`)
}
