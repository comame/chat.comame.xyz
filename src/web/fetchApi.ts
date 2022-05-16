import { createRoomResponse, getRoomRequest, getRoomResponse, postChatRequest, postChatResponse, getChatRequest, getChatResponse, setPubkeyRequest, setPubkeyResponse, getPubkeyRequest, getPubkeyResponse, errorResponse } from '../types'

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

export async function fetchApi<E extends keyof apiTypes>(
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
