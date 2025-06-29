import { useCallback, useMemo } from 'react'
import { useShape } from '../../hooks/use-shape'
import { BoundingBox } from '../../types'

interface LineProps {
	x1: number
	y1: number
	x2: number
	y2: number
	opacity?: number
	strokeColor?: string // Если не указан, линия невидима
	lineWidth?: number
	zIndex?: number
}

export const LineShape = ({
	x1,
	y1,
	x2,
	y2,
	opacity = 1,
	strokeColor, // По умолчанию не задан
	lineWidth = 1,
	zIndex = 0,
}: LineProps) => {
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			// Рисуем только если есть цвет и толщина
			if (!strokeColor || lineWidth <= 0) return

			ctx.beginPath()
			ctx.moveTo(x1, y1)
			ctx.lineTo(x2, y2)
			ctx.strokeStyle = strokeColor
			ctx.lineWidth = lineWidth
			ctx.stroke()
		},
		[x1, y1, x2, y2, strokeColor, lineWidth] // Зависимости для draw
	)

	const boundingBox = useMemo<BoundingBox>(() => {
		// Bounding box для линии - это прямоугольник, охватывающий ее
		// с учетом толщины линии.
		const minX = Math.min(x1, x2)
		const maxX = Math.max(x1, x2)
		const minY = Math.min(y1, y2)
		const maxY = Math.max(y1, y2)

		// Учитываем половину толщины линии для каждой стороны
		const halfLineWidth = lineWidth / 2

		return {
			x: minX - halfLineWidth,
			y: minY - halfLineWidth,
			width: maxX - minX + lineWidth,
			height: maxY - minY + lineWidth,
		}
	}, [x1, y1, x2, y2, lineWidth])

	const shapeParams = useMemo(
		() => ({ zIndex, opacity, box: boundingBox }),
		[zIndex, opacity, boundingBox]
	)

	useShape(draw, shapeParams)

	return null
}
