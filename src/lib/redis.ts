import { createClient } from 'redis'

const client = createClient({
    url: 'redis://redis.comame.dev'
})

client.on('error', (err) => {
    console.error(err)
})

const prefix = 'chat.comame.xyz'

async function conn() {
    if (!client.isOpen) {
        await client.connect()
    }
}

export async function set(key: string, value: string, ttlSec?: number) {
    await conn()
    if (typeof ttlSec === 'undefined') {
        return client.set(`${prefix}:${key}`, value)
    } else {
        return client.set(`${prefix}:${key}`, value, {
            EX: ttlSec
        })
    }
}

export async function del(key: string) {
    await conn()
    return client.del(`${prefix}:${key}`)
}

export async function keys(pattern?: string) {
    await conn()
    if (typeof pattern === 'undefined') {
        return client.keys(`${prefix}:*`)
    } else {
        return client.keys(`${prefix}:${pattern}`)
    }
}

export async function expire(key: string, seconds: number) {
    await conn()
    return client.expire(`${prefix}:${key}`, seconds)
}
