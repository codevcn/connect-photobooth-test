// import { useState, useRef, useEffect } from 'react'

// const SwipeKeyboard = () => {
//   const [text, setText] = useState('')
//   const [isDrawing, setIsDrawing] = useState(false)
//   const [currentPath, setCurrentPath] = useState([])
//   const [recognizedChar, setRecognizedChar] = useState('')
//   const canvasRef = useRef(null)
//   const ctxRef = useRef(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (canvas) {
//       const ctx = canvas.getContext('2d')
//       ctx.lineCap = 'round'
//       ctx.lineJoin = 'round'
//       ctx.lineWidth = 3
//       ctx.strokeStyle = '#2563eb'
//       ctxRef.current = ctx
//     }
//   }, [])

//   const getCoordinates = (e) => {
//     const canvas = canvasRef.current
//     const rect = canvas.getBoundingClientRect()

//     if (e.touches) {
//       return {
//         x: e.touches[0].clientX - rect.left,
//         y: e.touches[0].clientY - rect.top,
//       }
//     }
//     return {
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//     }
//   }

//   const startDrawing = (e) => {
//     e.preventDefault()
//     setIsDrawing(true)
//     const coords = getCoordinates(e)
//     setCurrentPath([coords])

//     const ctx = ctxRef.current
//     ctx.beginPath()
//     ctx.moveTo(coords.x, coords.y)
//   }

//   const draw = (e) => {
//     if (!isDrawing) return
//     e.preventDefault()

//     const coords = getCoordinates(e)
//     setCurrentPath((prev) => [...prev, coords])

//     const ctx = ctxRef.current
//     ctx.lineTo(coords.x, coords.y)
//     ctx.stroke()
//   }

//   const stopDrawing = (e) => {
//     if (!isDrawing) return
//     e.preventDefault()
//     setIsDrawing(false)

//     // Nhận dạng ký tự từ đường vẽ
//     const char = recognizeCharacter(currentPath)
//     setRecognizedChar(char)

//     // Tự động thêm vào text sau 500ms
//     setTimeout(() => {
//       if (char) {
//         setText((prev) => prev + char)
//       }
//       clearCanvas()
//       setRecognizedChar('')
//     }, 500)
//   }

//   const clearCanvas = () => {
//     const canvas = canvasRef.current
//     const ctx = ctxRef.current
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
//     setCurrentPath([])
//   }

//   const recognizeCharacter = (path) => {
//     if (path.length < 5) return ''

//     const features = extractFeatures(path)

//     // Phân tích hướng vuốt chính
//     const direction = features.mainDirection
//     const curvature = features.curvature
//     const aspectRatio = features.aspectRatio

//     // Nhận dạng đơn giản dựa trên hướng và hình dạng
//     if (direction === 'vertical' && curvature < 0.3) {
//       return 'I'
//     } else if (direction === 'horizontal' && curvature < 0.3) {
//       return '-'
//     } else if (curvature > 0.7 && aspectRatio < 1.5) {
//       return 'O'
//     } else if (direction === 'up-right') {
//       return '/'
//     } else if (direction === 'down-right') {
//       return '\\'
//     } else if (curvature > 0.5 && features.hasLoop) {
//       return 'e'
//     } else if (direction === 'vertical' && features.height > features.width * 1.5) {
//       return 'l'
//     } else if (curvature > 0.4 && direction === 'right') {
//       return 'c'
//     } else if (features.zigzag) {
//       return 'z'
//     }

//     // Mặc định
//     return '~'
//   }

//   const extractFeatures = (path) => {
//     if (path.length < 2) return {}

//     const minX = Math.min(...path.map((p) => p.x))
//     const maxX = Math.max(...path.map((p) => p.x))
//     const minY = Math.min(...path.map((p) => p.y))
//     const maxY = Math.max(...path.map((p) => p.y))

//     const width = maxX - minX
//     const height = maxY - minY
//     const aspectRatio = width / (height || 1)

//     // Tính hướng chính
//     const deltaX = path[path.length - 1].x - path[0].x
//     const deltaY = path[path.length - 1].y - path[0].y

//     let mainDirection = 'unknown'
//     if (Math.abs(deltaX) < width * 0.3 && height > width) {
//       mainDirection = 'vertical'
//     } else if (Math.abs(deltaY) < height * 0.3 && width > height) {
//       mainDirection = 'horizontal'
//     } else if (deltaX > 0 && deltaY < 0) {
//       mainDirection = 'up-right'
//     } else if (deltaX > 0 && deltaY > 0) {
//       mainDirection = 'down-right'
//     } else {
//       mainDirection = 'right'
//     }

//     // Tính độ cong
//     let totalAngleChange = 0
//     for (let i = 1; i < path.length - 1; i++) {
//       const v1 = { x: path[i].x - path[i - 1].x, y: path[i].y - path[i - 1].y }
//       const v2 = { x: path[i + 1].x - path[i].x, y: path[i + 1].y - path[i].y }
//       const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x)
//       totalAngleChange += Math.abs(angle)
//     }
//     const curvature = totalAngleChange / (path.length - 2)

//     // Kiểm tra vòng lặp
//     const hasLoop = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) < (width + height) * 0.3

//     // Kiểm tra zigzag
//     let directionChanges = 0
//     for (let i = 1; i < path.length - 1; i++) {
//       const d1 = path[i].y - path[i - 1].y
//       const d2 = path[i + 1].y - path[i].y
//       if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) {
//         directionChanges++
//       }
//     }
//     const zigzag = directionChanges > 2

//     return {
//       width,
//       height,
//       aspectRatio,
//       mainDirection,
//       curvature,
//       hasLoop,
//       zigzag,
//     }
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
//         <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Bàn Phím Vuốt Tay</h1>

//         {/* Hiển thị text */}
//         <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[80px] border-2 border-gray-200">
//           <p className="text-lg text-gray-700 break-words">
//             {text || <span className="text-gray-400 italic">Vuốt để viết...</span>}
//           </p>
//         </div>

//         {/* Canvas vẽ */}
//         <div className="relative mb-4">
//           <canvas
//             ref={canvasRef}
//             width={400}
//             height={300}
//             className="border-2 border-blue-300 rounded-lg bg-white cursor-crosshair touch-none"
//             onMouseDown={startDrawing}
//             onMouseMove={draw}
//             onMouseUp={stopDrawing}
//             onMouseLeave={stopDrawing}
//             onTouchStart={startDrawing}
//             onTouchMove={draw}
//             onTouchEnd={stopDrawing}
//           />

//           {/* Hiển thị ký tự nhận dạng */}
//           {recognizedChar && (
//             <div className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded-full text-2xl font-bold shadow-lg animate-pulse">
//               {recognizedChar}
//             </div>
//           )}
//         </div>

//         {/* Hướng dẫn */}
//         <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
//           <p className="font-semibold mb-1">💡 Hướng dẫn:</p>
//           <ul className="list-disc list-inside space-y-1 text-xs">
//             <li>
//               Vẽ dọc: <strong>I</strong> hoặc <strong>l</strong>
//             </li>
//             <li>
//               Vẽ ngang: <strong>-</strong>
//             </li>
//             <li>
//               Vẽ tròn: <strong>O</strong>
//             </li>
//             <li>
//               Vẽ cong: <strong>c</strong>, <strong>e</strong>
//             </li>
//             <li>
//               Vẽ ziczac: <strong>z</strong>
//             </li>
//           </ul>
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-2">
//           <button
//             onClick={clearCanvas}
//             className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
//           >
//             Xóa Canvas
//           </button>
//           <button
//             onClick={() => setText((prev) => prev.slice(0, -1))}
//             className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
//           >
//             Xóa Ký Tự
//           </button>
//           <button
//             onClick={() => setText('')}
//             className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
//           >
//             Xóa Hết
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default SwipeKeyboard
export default function Dev() { 
  return <></>
}
