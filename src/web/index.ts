import { generateEcdhKeypair } from '../lib/encrypt'
import { createRoomResponse, errorResponse, getChatRequest, getChatResponse, getPubkeyRequest, getPubkeyResponse, getRoomRequest, getRoomResponse, postChatRequest, postChatResponse, setPubkeyRequest, setPubkeyResponse } from '../types'
import './index.html'

type apiTypes = {
    '/api/room/create': {
        request: {}
        response: createRoomResponse
    },
    '/api/room/get': {
        request: getRoomRequest,
        response: getRoomResponse
    },
    '/api/chat/post': {
        request: postChatRequest,
        response: postChatResponse
    },
    '/api/chat/get': {
        request: getChatRequest,
        response: getChatResponse
    },
    '/api/pubkey/set': {
        request: setPubkeyRequest,
        response: setPubkeyResponse
    },
    '/api/pubkey/get': {
        request: getPubkeyRequest,
        response: getPubkeyResponse
    }
}

async function fetchApi<E extends keyof apiTypes>(
    endpoint: E,
    body: apiTypes[E]['request']
): Promise<apiTypes[E]['response']|errorResponse> {
    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(res => res.json())
}

window.addEventListener('load', async () => {
    const myKeypair = await generateEcdhKeypair()
    const createRoomResponse = await fetchApi('/api/room/create', {})

    if (createRoomResponse.kind === 'errorResponse') {
        console.error(createRoomResponse)
        return
    }

    console.log(myKeypair, createRoomResponse)
})
