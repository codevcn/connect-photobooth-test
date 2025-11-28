import fs from 'fs'
import path from 'path'

type NewApiProduct = {
  id: number
  slug: string
  base_image_url: string
  surfaces?: Array<{
    id: number
    preview_image_url: string
  }>
  variants: Array<{
    id: number
    variant_surfaces?: Array<{
      variant_id: number
      surface_id: number
      mockup_url: string
    }>
  }>
  mockups?: Array<{
    variant_id: number
    surface_id: number
    mockup_url: string
  }>
}

type NewApiData = {
  expiresAt: number
  timestamp: number
  data: NewApiProduct[]
}

type CacheProduct = {
  id: number
  slug: string
  url: string
  printAreaList?: Array<{
    id: number
    imageUrl: string
  }>
  variantSurfaces?: Array<{
    variantId: number
    surfaceId: number
    imageURL: string
  }>
}

type CacheData = {
  data: CacheProduct[]
}

function loadJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function saveJson<T>(filePath: string, data: T) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function main() {
  const root = path.resolve(__dirname, '..')
  const newApiPath = path.resolve(root, 'new-api.txt')
  const cachePath = path.resolve(root, 'data-for-cache.json')

  const newApi = loadJson<NewApiData>(newApiPath)
  const cache = loadJson<CacheData>(cachePath)

  // Build map by slug for quick lookup
  const cacheBySlug = new Map<string, CacheProduct>()
  for (const c of cache.data) {
    cacheBySlug.set(c.slug, c)
  }

  for (const prod of newApi.data) {
    const cached = cacheBySlug.get(prod.slug)
    if (!cached) continue

    // Replace base image url
    if (cached.url) {
      prod.base_image_url = cached.url
    }

    // Replace surface preview images using cache printAreaList by matching surface id
    if (prod.surfaces && cached.printAreaList && cached.printAreaList.length > 0) {
      for (const s of prod.surfaces) {
        const match = cached.printAreaList.find((p) => p.id === s.id)
        if (match && match.imageUrl) {
          s.preview_image_url = match.imageUrl
        }
      }
    }

    // Replace variant_surfaces mockup_url using cache variantSurfaces by variantId+surfaceId
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

    // Also update top-level mockups if present
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
  // eslint-disable-next-line no-console
  console.log('Updated image URLs in new-api.txt based on data-for-cache.json')
}

main()
