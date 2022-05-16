import express from 'express'
import crypto from 'crypto'
import path from 'path'
import { createRoom, getChat, getPubkey, getRoom, postChat, setPubkey } from './room'
import { createRoomResponse, errorResponse, getChatRequest, getChatResponse, getPubkeyRequest, getPubkeyResponse, getRoomRequest, getRoomResponse, isGetChatRequest, isGetPubkeyRequest, isGetRoomRequest, isPostChatRequest, isSetPubkeyRequest, postChatRequest, postChatResponse, setPubkeyRequest, setPubkeyResponse } from '../types'

globalThis.crypto = crypto as any

const app = express()
app.use(express.json())
app.use(express.static(path.resolve(__dirname, '..')))

function sendInvalidRequestBodyError(res: express.Response) {
    res.status(400).json({ kind: 'errorResponse', error: 'invalid_request_body_type'})
}

app.post<{}, createRoomResponse>('/api/room/create', async (_req, res) => {
    const room = await createRoom()
    res.json({
        kind: 'createRoomResponse',
        item: room
    })
})

app.post<{}, getRoomResponse|errorResponse, getRoomRequest>('/api/room/get', async (req, res) => {
    if (!isGetRoomRequest(req.body)) {
        sendInvalidRequestBodyError(res)
        return
    }

    const room = await getRoom(req.body.item.inviteId.toLowerCase())
    res.json({
        kind: 'getRoomResponse',
        item: room
    })
})

app.post<{}, postChatResponse|errorResponse, postChatRequest>('/api/chat/post', async (req, res) => {
    if (!isPostChatRequest(req.body)) {
        sendInvalidRequestBodyError(res)
        return
    }

    const body = req.body.item
    const success = await postChat(body.roomId.toLowerCase(), body.payload, body.party)
    res.json({
        kind: 'postChatResponse',
        item: {
            ok: success
        }
    })
})

app.post<{}, getChatResponse, getChatRequest>('/api/chat/get', async (req, res) => {
    if (!isGetChatRequest(req.body)) {
        sendInvalidRequestBodyError(res)
        return
    }

    const body = req.body.item
    const chats = await getChat(body.roomId.toLowerCase(), body.party, body.since)
    res.json({
        kind: 'getChatResponse',
        item: {
            ok: true,
            chats
        }
    })
})

app.post<{}, setPubkeyResponse, setPubkeyRequest>('/api/pubkey/set', async (req, res) => {
    if (!isSetPubkeyRequest(req.body)) {
        sendInvalidRequestBodyError(res)
        return
    }

    const body = req.body.item
    const success = await setPubkey(body.roomId.toLowerCase(), body.party, body.pubkey)
    res.json({
        kind: 'setPubkeyResponse',
        item: {
            ok: success
        }
    })
})

app.post<{}, getPubkeyResponse, getPubkeyRequest>('/api/pubkey/get', async (req, res) => {
    if (!isGetPubkeyRequest(req.body)) {
        sendInvalidRequestBodyError(res)
        return
    }

    const body = req.body.item
    const pubkey = await getPubkey(body.roomId.toLowerCase(), body.myParty)

    if (pubkey === null) {
        res.json({
            kind: 'getPubkeyResponse',
            item: {
                ok: false
            }
        })
    } else {
        res.json({
            kind: 'getPubkeyResponse',
            item: {
                ok: true,
                party: body.myParty == 'A' ? 'B' : 'A',
                pubkey
            }
        })
    }
})

app.listen(8080, () => {
    console.log('server started: ' + 'http://localhost:8080')
})
