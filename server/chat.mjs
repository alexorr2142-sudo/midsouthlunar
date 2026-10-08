import { createChatServer } from './http.mjs'

const port = Number(process.env.CHAT_PORT || 8787)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid CHAT_PORT')
const host = process.env.CHAT_HOST || '127.0.0.1'
const server = createChatServer()
server.listen(port, host, () => console.log(`Chat service listening on http://${host}:${port}`))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)))
