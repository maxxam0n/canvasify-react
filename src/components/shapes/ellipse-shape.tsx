import { useCallback, useMemo } from 'react'
import { useShape } from '../../hooks/use-shape'
import { BoundingBox } from '../../types'

interface EllipseProps {
	cx?: number
	cy?: number
	radiusX: number
	radiusY: number
	opacity?: number
	rotation?: number
	fillColor?: string
	strokeColor?: string
	lineWidth?: number
	zIndex?: number
}

export const EllipseShape = ({
	cx = 0,
	cy = 0,
	radiusX,
	radiusY,
	opacity = 1,
	rotation = 0,
	fillColor = 'white',
	strokeColor,
	lineWidth = 1,
	zIndex = 0,
}: EllipseProps) => {
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			ctx.beginPath()
			ctx.ellipse(cx, cy, radiusX, radiusY, rotation, 0, Math.PI * 2)

			if (fillColor) {
				ctx.fillStyle = fillColor
				ctx.fill()
			}
			if (strokeColor && lineWidth > 0) {
				ctx.strokeStyle = strokeColor
				ctx.lineWidth = lineWidth
				ctx.stroke()
			}
		},
		[cx, cy, radiusX, radiusY, fillColor, strokeColor, lineWidth, rotation]
	)

	const boundingBox = useMemo<BoundingBox>(() => {
		if (rotation === 0) {
			return {
				x: cx - radiusX - lineWidth / 2,
				y: cy - radiusY - lineWidth / 2,
				width: radiusX * 2 + lineWidth,
				height: radiusY * 2 + lineWidth,
			}
		}

		// Случай с вращением: аппроксимация через поворот 4-х крайних точек
		const points = [
			{ x: radiusX, y: 0 }, // Правая точка
			{ x: -radiusX, y: 0 }, // Левая точка
			{ x: 0, y: radiusY }, // Нижняя точка (y положителен вниз в canvas)
			{ x: 0, y: -radiusY }, // Верхняя точка
		]

		const cos = Math.cos(rotation)
		const sin = Math.sin(rotation)

		let minX = Infinity
		let maxX = -Infinity
		let minY = Infinity
		let maxY = -Infinity

		points.forEach(p => {
			const rotatedX = p.x * cos - p.y * sin
			const rotatedY = p.x * sin + p.y * cos

			minX = Math.min(minX, rotatedX)
			maxX = Math.max(maxX, rotatedX)
			minY = Math.min(minY, rotatedY)
			maxY = Math.max(maxY, rotatedY)
		})

		const halfLineWidth = lineWidth / 2

		return {
			x: cx + minX - halfLineWidth,
			y: cy + minY - halfLineWidth,
			width: maxX - minX + lineWidth,
			height: maxY - minY + lineWidth,
		}
	}, [cx, cy, radiusX, radiusY, rotation, lineWidth])

	const shapeParams = useMemo(
		() => ({ zIndex, opacity, box: boundingBox }),
		[zIndex, opacity, boundingBox]
	)

	useShape(draw, shapeParams)

	return null
}
