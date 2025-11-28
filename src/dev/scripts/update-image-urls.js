import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function main() {
  const root = path.resolve(__dirname, '..')
  const newApiPath = path.resolve(root, 'new-api.txt')
  const cachePath = path.resolve(root, 'data-for-cache.json')

  const newApi = loadJson(newApiPath)
  const cache = loadJson(cachePath)

  const cacheBySlug = new Map()
  for (const c of cache.data) {
    cacheBySlug.set(c.slug, c)
  }

  for (const prod of newApi.data) {
    const cached = cacheBySlug.get(prod.slug)
    if (!cached) continue

    if (cached.url) {
      prod.base_image_url = cached.url
    }

    if (prod.surfaces && cached.printAreaList && cached.printAreaList.length > 0) {
      for (const s of prod.surfaces) {
        const match = cached.printAreaList.find((p) => p.id === s.id)
        if (match && match.imageUrl) {
          s.preview_image_url = match.imageUrl
        }
      }
    }

    if (prod.variants && cached.variantSurfaces && cached.variantSurfaces.length > 0) {
      for (const v of prod.variants) {
        if (!v.variant_surfaces) continue
        for (const vs of v.variant_surfaces) {
          const match = cached.variantSurfaces.find(
            (cs) => cs.variantId === (vs.variant_id || v.id) && cs.surfaceId === vs.surface_id
          )
          if (match && match.imageURL) {
            vs.mockup_url = match.imageURL
          }
        }
      }
    }

    if (prod.mockups && cached.variantSurfaces && cached.variantSurfaces.length > 0) {
      for (const m of prod.mockups) {
        const match = cached.variantSurfaces.find(
          (cs) => cs.variantId === m.variant_id && cs.surfaceId === m.surface_id
        )
        if (match && match.imageURL) {
          m.mockup_url = match.imageURL
        }
      }
    }
  }

  saveJson(newApiPath, newApi)
  console.log('Updated image URLs in new-api.txt based on data-for-cache.json')
}

main()
