/**
 * Vite plugin that provides local filesystem storage API.
 *
 * Endpoints:
 *   GET  /storage/meta/:collection          → read metadata.json
 *   POST /storage/meta/:collection          → write metadata.json
 *   POST /storage/image/:collection/:name   → write image (base64 body)
 *   GET  /storage/image/:collection/:name   → read image as data URL
 *   DELETE /storage/image/:collection/:name → delete image file
 */
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const DATA_ROOT = path.resolve(process.cwd(), 'data')

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function collectionDir(collection: string): string {
  // Prevent path traversal
  const safe = collection.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(DATA_ROOT, safe)
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export default function localStoragePlugin(): Plugin {
  return {
    name: 'vite-plugin-local-storage',
    configureServer(server) {
      ensureDir(DATA_ROOT)

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''

        if (!url.startsWith('/storage/')) {
          return next()
        }

        try {
          // ── GET /storage/meta/:collection ──
          const metaGetMatch = url.match(/^\/storage\/meta\/([a-zA-Z0-9_-]+)$/)
          if (metaGetMatch && req.method === 'GET') {
            const dir = collectionDir(metaGetMatch[1])
            const metaFile = path.join(dir, 'metadata.json')
            if (fs.existsSync(metaFile)) {
              const content = fs.readFileSync(metaFile, 'utf-8')
              sendJson(res, 200, { ok: true, data: JSON.parse(content) })
            } else {
              sendJson(res, 200, { ok: true, data: [] })
            }
            return
          }

          // ── POST /storage/meta/:collection ──
          if (metaGetMatch && req.method === 'POST') {
            const dir = collectionDir(metaGetMatch[1])
            ensureDir(dir)
            const body = await readBody(req)
            const metaFile = path.join(dir, 'metadata.json')
            fs.writeFileSync(metaFile, body, 'utf-8')
            sendJson(res, 200, { ok: true })
            return
          }

          // ── POST /storage/image/:collection/:name ──
          const imageMatch = url.match(/^\/storage\/image\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/)
          if (imageMatch && req.method === 'POST') {
            const dir = collectionDir(imageMatch[1])
            const imgDir = path.join(dir, 'images')
            ensureDir(imgDir)

            const body = await readBody(req)
            // Body is a data URL: data:image/png;base64,xxx
            const base64Match = body.match(/^data:([^;]+);base64,(.+)$/)
            if (base64Match) {
              const buffer = Buffer.from(base64Match[2], 'base64')
              fs.writeFileSync(path.join(imgDir, imageMatch[2]), buffer)
              sendJson(res, 200, { ok: true })
            } else {
              sendJson(res, 400, { ok: false, error: 'Invalid data URL format' })
            }
            return
          }

          // ── GET /storage/image/:collection/:name ──
          if (imageMatch && req.method === 'GET') {
            const dir = collectionDir(imageMatch[1])
            const filePath = path.join(dir, 'images', imageMatch[2])
            if (fs.existsSync(filePath)) {
              const buffer = fs.readFileSync(filePath)
              const ext = path.extname(imageMatch[2]).slice(1) || 'png'
              const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
              const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
              sendJson(res, 200, { ok: true, data: dataUrl })
            } else {
              sendJson(res, 404, { ok: false, error: 'Not found' })
            }
            return
          }

          // ── DELETE /storage/image/:collection/:name ──
          if (imageMatch && req.method === 'DELETE') {
            const dir = collectionDir(imageMatch[1])
            const filePath = path.join(dir, 'images', imageMatch[2])
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
            sendJson(res, 200, { ok: true })
            return
          }

          // ── GET /storage/health ──
          if (url === '/storage/health' && req.method === 'GET') {
            sendJson(res, 200, { ok: true, dataRoot: DATA_ROOT })
            return
          }

          sendJson(res, 404, { ok: false, error: 'Unknown storage route' })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Internal error'
          sendJson(res, 500, { ok: false, error: message })
        }
      })
    },
  }
}
