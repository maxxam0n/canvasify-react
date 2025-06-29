import { useCallback, useMemo } from 'react'
import { useShape } from '../../hooks/use-shape'
import { BoundingBox, ShapeParams } from '../../types'

interface Point {
	x: number
	y: number
}

interface PolygonProps {
	points: Point[]
	closed?: boolean
	zIndex?: number
	opacity?: number
	fillColor?: string
	strokeColor?: string
	lineWidth?: number
}

export const PolygonShape = ({
	points,
	closed,
	zIndex = 0,
	opacity = 1,
	fillColor,
	strokeColor,
	lineWidth = 1,
}: PolygonProps) => {
	const isClosed = closed ?? !!fillColor

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			if (!points || points.length < (isClosed ? 3 : 2)) return // Для замкнутого нужно хотя бы 3 точки

			ctx.beginPath()
			ctx.moveTo(points[0].x, points[0].y)

			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i].x, points[i].y)
			}

			if (isClosed) {
				ctx.closePath()
			}

			if (fillColor && isClosed) {
				ctx.fillStyle = fillColor
				ctx.fill()
			}
			if (strokeColor && lineWidth > 0) {
				ctx.strokeStyle = strokeColor
				ctx.lineWidth = lineWidth
				ctx.stroke()
			}
		},
		[points, isClosed, fillColor, strokeColor, lineWidth]
	)

	const boundingBox = useMemo<BoundingBox>(() => {
		if (!points || points.length === 0) {
			return { x: 0, y: 0, width: 0, height: 0 }
		}

		let minX = points[0].x
		let maxX = points[0].x
		let minY = points[0].y
		let maxY = points[0].y

		for (let i = 1; i < points.length; i++) {
			minX = Math.min(minX, points[i].x)
			maxX = Math.max(maxX, points[i].x)
			minY = Math.min(minY, points[i].y)
			maxY = Math.max(maxY, points[i].y)
		}

		const halfLineWidth = strokeColor && lineWidth > 0 ? lineWidth / 2 : 0

		return {
			x: minX - halfLineWidth,
			y: minY - halfLineWidth,
			width:
				maxX - minX + lineWidth * (strokeColor && lineWidth > 0 ? 1 : 0),
			height:
				maxY - minY + lineWidth * (strokeColor && lineWidth > 0 ? 1 : 0),
		}
	}, [points, strokeColor, lineWidth])

	const shapeParams = useMemo<ShapeParams>(
		() => ({
			zIndex,
			opacity,
			box: boundingBox,
		}),
		[zIndex, opacity, boundingBox]
	)

	useShape(draw, shapeParams)

	return null
}
