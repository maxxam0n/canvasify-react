import { useMemo, useCallback } from 'react'
import { useShape } from '../../hooks/use-shape'
import { BoundingBox, ShapeParams } from '../../types'
import { useCachedTextMetrics } from '../../hooks/use-cached-text-metrics'

interface TextProps {
	x?: number
	y?: number
	text: string | number
	opacity?: number
	font?: string
	textAlign?: CanvasTextAlign
	textBaseline?: CanvasTextBaseline
	direction?: CanvasDirection
	maxWidth?: number
	fillColor?: string
	strokeColor?: string
	lineWidth?: number
	zIndex?: number
}

export const TextShape = ({
	x = 0,
	y = 0,
	text,
	opacity = 1,
	font = '16px sans-serif',
	textAlign = 'start',
	textBaseline = 'alphabetic',
	direction = 'inherit',
	fillColor,
	strokeColor,
	lineWidth = 1,
	maxWidth,
	zIndex = 0,
}: TextProps) => {
	const textToDraw = String(text)
	const textMetrics = useCachedTextMetrics(textToDraw, font)

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			if (!textToDraw) return
			ctx.font = font
			ctx.textAlign = textAlign
			ctx.textBaseline = textBaseline
			ctx.direction = direction

			// Отрисовка с заливкой
			if (fillColor) {
				ctx.fillStyle = fillColor
				if (maxWidth !== undefined) {
					ctx.fillText(textToDraw, x, y, maxWidth)
				} else {
					ctx.fillText(textToDraw, x, y)
				}
			}

			// Отрисовка с обводкой
			if (strokeColor && lineWidth > 0) {
				ctx.strokeStyle = strokeColor
				ctx.lineWidth = lineWidth
				if (maxWidth !== undefined) {
					ctx.strokeText(textToDraw, x, y, maxWidth)
				} else {
					ctx.strokeText(textToDraw, x, y)
				}
			}
		},
		[
			x,
			y,
			textToDraw,
			font,
			textAlign,
			textBaseline,
			direction,
			fillColor,
			strokeColor,
			lineWidth,
			maxWidth,
		]
	)

	const boundingBox = useMemo<BoundingBox>(() => {
		if (!textMetrics) {
			return { x, y, width: 0, height: 0 }
		}

		// TextMetrics предоставляет много информации, но для BoundingBox нам нужны
		// actualBoundingBoxLeft, actualBoundingBoxRight,
		// actualBoundingBoxAscent, actualBoundingBoxDescent.
		// `width` из measureText() - это advanceWidth, он не всегда равен видимой ширине.

		let boxX = x
		let boxY = y
		let boxWidth = textMetrics.width // Используем advanceWidth как базовую ширину
		const boxHeight =
			textMetrics.actualBoundingBoxAscent +
			textMetrics.actualBoundingBoxDescent

		// Корректировка x в зависимости от textAlign
		// (x,y) - это точка привязки текста
		if (textAlign === 'center') {
			boxX -= boxWidth / 2
		} else if (textAlign === 'end' || textAlign === 'right') {
			boxX -= boxWidth
		}
		// Для 'start' или 'left' корректировка не нужна, так как x уже левая граница (или начало)

		// Корректировка y в зависимости от textBaseline
		if (textBaseline === 'middle') {
			boxY -= boxHeight / 2
		} else if (textBaseline === 'bottom' || textBaseline === 'ideographic') {
			boxY -= boxHeight
		} else if (textBaseline === 'top' || textBaseline === 'hanging') {
			// y уже верхняя граница
		} else {
			// alphabetic (дефолт)
			boxY -= textMetrics.actualBoundingBoxAscent
		}

		// Если задан maxWidth и он меньше вычисленной ширины, используем его
		if (maxWidth !== undefined && maxWidth < boxWidth) {
			// Если текст обрезается, нужно скорректировать x для textAlign='center' или 'end'/'right'
			if (textAlign === 'center') {
				boxX += (boxWidth - maxWidth) / 2
			} else if (textAlign === 'end' || textAlign === 'right') {
				boxX += boxWidth - maxWidth
			}
			boxWidth = maxWidth
		}

		// Учитываем обводку, если она есть
		const halfLineWidth = strokeColor && lineWidth > 0 ? lineWidth / 2 : 0

		return {
			x: boxX - halfLineWidth,
			y: boxY - halfLineWidth,
			width: boxWidth + lineWidth * (strokeColor && lineWidth > 0 ? 1 : 0),
			height: boxHeight + lineWidth * (strokeColor && lineWidth > 0 ? 1 : 0),
		}
	}, [
		x,
		y,
		textMetrics,
		textAlign,
		textBaseline,
		maxWidth,
		strokeColor,
		lineWidth,
	])

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
