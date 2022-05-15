import express from 'express'
import crypto from 'crypto'
import { set, del, keys } from './lib/redis'

globalThis.crypto = crypto as any

const app = express()

app.listen(8080, () => {
    console.log('server started.')
})

;(async () => {
    console.log(await set('abc', 'hoge'))
    console.log(await keys())
    console.log(await keys('abc'))
    console.log(await keys('a*'))
    console.log(await keys('*c'))
    console.log(await keys('f'))
    console.log(await del('abc'))
})()
