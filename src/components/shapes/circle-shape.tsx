import { useCallback, useMemo } from 'react'
import { BoundingBox } from '../../types'
import { useShape } from '../../hooks/use-shape'

interface CircleProps {
	radius: number
	cx?: number
	cy?: number
	opacity?: number
	fillColor?: string
	strokeColor?: string
	lineWidth?: number
	zIndex?: number
}

export const CircleShape = ({
	cx = 0,
	cy = 0,
	radius,
	strokeColor,
	opacity = 1,
	fillColor = 'white',
	lineWidth = 1,
	zIndex = 0,
}: CircleProps) => {
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			ctx.beginPath()
			ctx.arc(cx, cy, radius, 0, Math.PI * 2)
			ctx.fillStyle = fillColor
			ctx.fill()

			if (strokeColor && lineWidth > 0) {
				ctx.strokeStyle = strokeColor
				ctx.lineWidth = lineWidth
				ctx.stroke()
			}
		},
		[cx, cy, radius, fillColor, strokeColor, lineWidth]
	)

	const boundingBox = useMemo<BoundingBox>(() => {
		// Используем половину толщины линии для margin
		const halfLineWidth = (lineWidth || 0) / 2

		// x, y - это верхний левый угол bounding box
		const x = cx - radius - halfLineWidth
		const y = cy - radius - halfLineWidth

		// Ширина и высота bounding box включают полный диаметр + всю толщину линии
		const diameterWithStroke = radius * 2 + (lineWidth || 0)

		return {
			x,
			y,
			height: diameterWithStroke,
			width: diameterWithStroke,
		}
	}, [lineWidth, radius, cx, cy])

	const shapeParams = useMemo(
		() => ({ zIndex, opacity, box: boundingBox }),
		[zIndex, opacity, boundingBox]
	)

	useShape(draw, shapeParams)

	return null
}
