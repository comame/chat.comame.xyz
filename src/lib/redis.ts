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

export async function set(key: string, value: string, opt?: {
    expireSec?: number,
    unique?: boolean
}): Promise<boolean> {
    await conn()

    if (opt) {
        const _opt: any = {}
        if (opt.expireSec) {
            _opt.EX = opt.expireSec
        }
        if (opt.unique) {
            _opt.NX = true
        }
        const result = await client.set(`${prefix}:${key}`, value, _opt)
        return result === 'OK'
    } else {
        const result = await client.set(`${prefix}:${key}`, value)
        return result === 'OK'
    }
}

export async function get(key: string) {
    await conn()
    return client.get(`${prefix}:${key}`)
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
