export function uint8ArrayToHex(arr: Uint8Array): string {
    const dataView = new DataView(arr.buffer)
    const bytes = []
    for (let i = 0; i < dataView.byteLength; i += 1) {
        bytes.push(dataView.getUint8(i))
    }
    return bytes.map(it => it.toString(16)).map(it => ('00' + it).slice(-2)).join('')
}

export function hexToUint8array(hex: string) {
    const uint8Array = new Uint8Array(hex.length / 2)
    const dataView = new DataView(uint8Array.buffer)
    for (let i = 0; i < hex.length; i += 2) {
        const byteStr = hex[i] + hex[i + 1]
        const byte = Number.parseInt(byteStr, 16)
        dataView.setUint8(i / 2, byte)
    }
    return uint8Array
}
