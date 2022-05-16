export type createRoomResponse = {
    kind: 'createRoomResponse',
    item: {
        ok: true,
        roomId: string,
        inviteId: string
    } | {
        ok: false
    }
}

export type getRoomRequest = {
    kind: 'getRoomRequest',
    item: {
        inviteId: string
    }
}

export const isGetRoomRequest = (arg: any): arg is getRoomRequest => arg.kind === 'getRoomRequest'

export type getRoomResponse = {
    kind: 'getRoomResponse',
    item: {
        ok: true,
        roomId: string
    } | {
        ok: false
    }
}

export type postChatRequest = {
    kind: 'postChatRequest',
    item: {
        roomId: string,
        party: 'A'|'B',
        payload: string,
        iv: string
    }
}

export const isPostChatRequest = (arg: any): arg is postChatRequest => arg.kind === 'postChatRequest'

export type postChatResponse = {
    kind: 'postChatResponse',
    item: {
        ok: true | false
    }
}

export type getChatRequest = {
    kind: 'getChatRequest',
    item: {
        roomId: string,
        party: 'A'|'B',
        since: number
    }
}

export const isGetChatRequest = (arg: any): arg is getChatRequest => arg.kind === 'getChatRequest'

export type getChatResponse = {
    kind: 'getChatResponse',
    item: {
        ok: true,
        chats: {
            timestamp: number,
            party: 'A'|'B',
            payload: string,
            iv: string
        }[]
    }
}

export type setPubkeyRequest = {
    kind: 'setPubkeyRequest',
    item: {
        roomId: string,
        party: 'A'|'B',
        pubkey: string
    }
}
export const isSetPubkeyRequest = (arg: any): arg is setPubkeyRequest => arg.kind === 'setPubkeyRequest'

export type setPubkeyResponse = {
    kind: 'setPubkeyResponse',
    item: {
        ok: true | false
    }
}

export type getPubkeyRequest = {
    kind: 'getPubkeyRequest',
    item: {
        roomId: string,
        myParty: 'A'|'B'
    }
}

export const isGetPubkeyRequest = (arg: any): arg is getPubkeyRequest => arg.kind === 'getPubkeyRequest'

export type getPubkeyResponse = {
    kind: 'getPubkeyResponse',
    item: {
        ok: true,
        party: 'A'|'B'
        pubkey: string
    } | {
        ok: false
    }
}

export type errorResponse = {
    kind: 'errorResponse',
    error: string
}
