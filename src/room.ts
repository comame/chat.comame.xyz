import { uint8ArrayToHex } from "./lib/conv"
import { get, keys, set } from "./lib/redis"

const roomTtl = 600
const chatTtl = 120

export async function createRoom(): Promise<{ ok: true, roomId: string, inviteId: string } | { ok: false }> {
    const roomId = crypto.randomUUID()
    const inviteId = uint8ArrayToHex(crypto.getRandomValues(new Uint8Array(4)))
    console.log(roomId, inviteId)

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

export async function postChat(roomId: string, payload: string, party: 'A'|'B') {
    const timestamp = Date.now()
    return await set(`chat:${roomId}:${party}:${timestamp}`, payload, { expireSec: chatTtl })
}

export async function getChat(roomId: string, party: 'A'|'B', since: number) {
    const chatKeys = (await keys(`chat:${roomId}:*`)).filter(key => {
        const timestamp = Number.parseInt(key.split(':')[3])
        return timestamp > since
    })
    return Promise.all(chatKeys.map(async (chatKey) => {
        const payload = await get(chatKey)
        const party = chatKey.split(':')[2]
        const timestampStr = chatKey.split(':')[3]
        return {
            party: party as 'A'|'B',
            payload: payload as string,
            timestamp: Number.parseInt(timestampStr, 10)
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
