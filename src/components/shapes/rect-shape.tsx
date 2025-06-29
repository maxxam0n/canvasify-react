import { useCallback, useMemo } from 'react'
import { useShape } from '../../hooks/use-shape'
import { BoundingBox, ShapeParams } from '../../types'

interface RectProps {
	x?: number
	y?: number
	width: number
	height: number
	opacity?: number
	fillColor?: string
	strokeColor?: string
	lineWidth?: number
	zIndex?: number
}

export const RectShape = ({
	x = 0,
	y = 0,
	width,
	height,
	opacity = 1,
	fillColor,
	strokeColor,
	lineWidth = 1,
	zIndex = 0,
}: RectProps) => {
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			if (fillColor) {
				ctx.fillStyle = fillColor
				ctx.fillRect(x, y, width, height)
			}

			if (strokeColor && lineWidth > 0) {
				ctx.strokeStyle = strokeColor
				ctx.lineWidth = lineWidth
				ctx.strokeRect(x, y, width, height)
			}
		},
		[x, y, width, height, fillColor, strokeColor, lineWidth]
	)

	const boundingBox = useMemo<BoundingBox>(() => {
		const halfLineWidth = strokeColor && lineWidth > 0 ? lineWidth / 2 : 0

		return {
			x: x - halfLineWidth,
			y: y - halfLineWidth,
			width: width + lineWidth * (strokeColor && lineWidth > 0 ? 1 : 0),
			height: height + lineWidth * (strokeColor && lineWidth > 0 ? 1 : 0),
		}
	}, [x, y, width, height, strokeColor, lineWidth])

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
