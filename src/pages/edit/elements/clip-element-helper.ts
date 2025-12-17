/**
 * Helper functions để tính toán clip-path polygon cho elements nằm ngoài allowed print area
 */

type Point = { x: number; y: number }

/**
 * Lấy 4 góc của element sau khi transform (rotation + scale)
 */
const getTransformedCorners = (element: HTMLElement): Point[] => {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  const matrix = new DOMMatrix(style.transform)
console.log('>>> [kkk] matrix:', matrix)
  // Dimensions gốc (trước transform)
  const width = element.offsetWidth
  const height = element.offsetHeight

  // Center của element trong viewport
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // 4 góc relative to center (trước transform)
  const corners = [
    { x: -width / 2, y: -height / 2 }, // top-left
    { x: width / 2, y: -height / 2 }, // top-right
    { x: width / 2, y: height / 2 }, // bottom-right
    { x: -width / 2, y: height / 2 }, // bottom-left
  ]

  // Apply transform matrix và convert về viewport coordinates
  return corners.map((corner) => {
    const transformed = matrix.transformPoint({ x: corner.x, y: corner.y, z: 0, w: 1 })
    return {
      x: centerX + transformed.x,
      y: centerY + transformed.y,
    }
  })
}

/**
 * Clip line segment với rectangle boundary
 * @returns điểm intersection hoặc null nếu không intersect
 */
const clipLineWithRect = (
  p1: Point,
  p2: Point,
  rectLeft: number,
  rectTop: number,
  rectRight: number,
  rectBottom: number
): Point[] => {
  const intersections: Point[] = []

  // Helper: tính intersection của line segment với một cạnh của rect
  const getIntersection = (
    lineStart: Point,
    lineEnd: Point,
    edgeStart: Point,
    edgeEnd: Point
  ): Point | null => {
    const dx1 = lineEnd.x - lineStart.x
    const dy1 = lineEnd.y - lineStart.y
    const dx2 = edgeEnd.x - edgeStart.x
    const dy2 = edgeEnd.y - edgeStart.y

    const det = dx1 * dy2 - dy1 * dx2
    if (Math.abs(det) < 1e-10) return null // Parallel lines

    const t1 = ((edgeStart.x - lineStart.x) * dy2 - (edgeStart.y - lineStart.y) * dx2) / det
    const t2 = ((edgeStart.x - lineStart.x) * dy1 - (edgeStart.y - lineStart.y) * dx1) / det

    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
      return {
        x: lineStart.x + t1 * dx1,
        y: lineStart.y + t1 * dy1,
      }
    }
    return null
  }

  // Check intersection với 4 cạnh của rect
  const rectCorners = [
    { x: rectLeft, y: rectTop }, // top-left
    { x: rectRight, y: rectTop }, // top-right
    { x: rectRight, y: rectBottom }, // bottom-right
    { x: rectLeft, y: rectBottom }, // bottom-left
  ]

  for (let i = 0; i < 4; i++) {
    const edgeStart = rectCorners[i]
    const edgeEnd = rectCorners[(i + 1) % 4]
    const intersection = getIntersection(p1, p2, edgeStart, edgeEnd)
    if (intersection) {
      intersections.push(intersection)
    }
  }

  return intersections
}

/**
 * Kiểm tra điểm có nằm trong rectangle không
 */
const isPointInRect = (
  point: Point,
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean => {
  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
}

/**
 * Tính toán clip polygon cho element dựa trên vị trí relative với allowed print area
 * Hỗ trợ element bị rotate
 * @param element - Ref đến root element
 * @param allowedPrintArea - Ref đến vùng in cho phép
 * @returns polygon string cho clip-path hoặc null nếu không cần clip
 */
export const calculateElementClipPolygon = (
  element: HTMLElement | null,
  allowedPrintArea: HTMLElement | null
): string | null => {
  if (!element || !allowedPrintArea) return null

  // Get allowed area bounds
  const allowedRect = allowedPrintArea.getBoundingClientRect()
  console.log('>>> [kkk] allowedRect:', allowedRect)
  const allowedLeft = allowedRect.left
  const allowedTop = allowedRect.top
  const allowedRight = allowedRect.right
  const allowedBottom = allowedRect.bottom

  // Get transformed corners của element
  const corners = getTransformedCorners(element)
console.log('>>> [kkk] corners:', corners)
  // Tìm tất cả điểm cần giữ lại (trong allowed area hoặc intersection points)
  const clippedPoints: Point[] = []

  // 1. Add các góc của element nằm trong allowed area
  for (const corner of corners) {
    if (isPointInRect(corner, allowedLeft, allowedTop, allowedRight, allowedBottom)) {
      clippedPoints.push(corner)
    }
  }

  // 2. Add các điểm intersection giữa cạnh element và cạnh allowed area
  for (let i = 0; i < corners.length; i++) {
    const p1 = corners[i]
    const p2 = corners[(i + 1) % corners.length]
    const intersections = clipLineWithRect(
      p1,
      p2,
      allowedLeft,
      allowedTop,
      allowedRight,
      allowedBottom
    )
    clippedPoints.push(...intersections)
  }

  // 3. Add các góc của allowed area nằm trong element polygon
  const allowedCorners = [
    { x: allowedLeft, y: allowedTop },
    { x: allowedRight, y: allowedTop },
    { x: allowedRight, y: allowedBottom },
    { x: allowedLeft, y: allowedBottom },
  ]

  // Simple point-in-polygon check
  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y
      const xj = polygon[j].x,
        yj = polygon[j].y
      const intersect =
        yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  }

  for (const corner of allowedCorners) {
    if (isPointInPolygon(corner, corners)) {
      clippedPoints.push(corner)
    }
  }

  // Nếu không có điểm nào, element hoàn toàn ngoài allowed area
  if (clippedPoints.length === 0) {
    return 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)' // Clip toàn bộ
  }

  // Nếu tất cả góc element đều trong allowed area, không cần clip
  const allCornersInside = corners.every((corner) =>
    isPointInRect(corner, allowedLeft, allowedTop, allowedRight, allowedBottom)
  )
  if (allCornersInside) {
    return null
  }

  // Sort các điểm theo thứ tự ngược chiều kim đồng hồ (counter-clockwise)
  const center = clippedPoints.reduce(
    (acc, p) => ({ x: acc.x + p.x / clippedPoints.length, y: acc.y + p.y / clippedPoints.length }),
    { x: 0, y: 0 }
  )

  clippedPoints.sort((a, b) => {
    const angleA = Math.atan2(a.y - center.y, a.x - center.x)
    const angleB = Math.atan2(b.y - center.y, b.x - center.x)
    return angleA - angleB
  })

  // Convert viewport coordinates về local coordinates của element (trước transform)
  const style = window.getComputedStyle(element)
  const matrix = new DOMMatrix(style.transform)
  const inverseMatrix = matrix.inverse()

  const elementRect = element.getBoundingClientRect()
  const elementCenterX = elementRect.left + elementRect.width / 2
  const elementCenterY = elementRect.top + elementRect.height / 2

  const width = element.offsetWidth
  const height = element.offsetHeight

  const polygonPoints = clippedPoints
    .map((point) => {
      // Convert viewport point về local space (relative to element center)
      const relativeX = point.x - elementCenterX
      const relativeY = point.y - elementCenterY

      // Apply inverse transform
      const localPoint = inverseMatrix.transformPoint({ x: relativeX, y: relativeY, z: 0, w: 1 })

      // Convert to percentage (0-100%) relative to element's original size
      // Local coordinates: (-width/2 to +width/2, -height/2 to +height/2)
      // Percentage: (0% to 100%, 0% to 100%)
      const xPercent = ((localPoint.x + width / 2) / width) * 100
      const yPercent = ((localPoint.y + height / 2) / height) * 100

      return `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`
    })
    .join(', ')

  return `polygon(${polygonPoints})`
}
