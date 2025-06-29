import { useCallback, useEffect, useMemo, useState } from 'react'
import { useShape } from '../../hooks/use-shape'
import { BoundingBox } from '../../types'

interface ImageShapeProps {
	src: string
	x?: number
	y?: number
	opacity?: number
	width?: number // Если не указаны, используется натуральный размер изображения
	height?: number // Если не указаны, используется натуральный размер изображения
	zIndex?: number
}

type ImageStatus = 'loading' | 'loaded' | 'error'

export const ImageShape = ({
	src,
	x = 0,
	y = 0,
	width,
	height,
	opacity = 1,
	zIndex = 0,
}: ImageShapeProps) => {
	const [image, setImage] = useState<HTMLImageElement | null>(null)
	const [status, setStatus] = useState<ImageStatus>('loading')

	useEffect(() => {
		if (!src) {
			setStatus('error')
			setImage(null) // Явно сбрасываем изображение
			return
		}

		// Сбрасываем состояние при смене src, чтобы показать загрузку нового изображения
		setStatus('loading')
		setImage(null)

		const img = new Image()
		img.src = src

		const handleLoad = () => {
			setStatus('loaded')
			setImage(img)
		}

		const handleError = () => {
			setStatus('error')
			setImage(null)
			console.error(`Не удалось загрузить изображение по адресу: ${src}`)
		}

		img.addEventListener('load', handleLoad)
		img.addEventListener('error', handleError)

		// Очистка при размонтировании или смене src
		return () => {
			img.removeEventListener('load', handleLoad)
			img.removeEventListener('error', handleError)
		}
	}, [src]) // Зависимость только от src

	const actualWidth = useMemo(() => {
		return width ?? (status === 'loaded' && image ? image.naturalWidth : 0)
	}, [width, image, status])

	const actualHeight = useMemo(() => {
		return height ?? (status === 'loaded' && image ? image.naturalHeight : 0)
	}, [height, image, status])

	const boundingBox = useMemo<BoundingBox>(() => {
		return {
			x,
			y,
			width: actualWidth,
			height: actualHeight,
		}
	}, [x, y, actualWidth, actualHeight])

	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			if (status === 'loaded' && image) {
				ctx.drawImage(image, x, y, actualWidth, actualHeight)
			}
		},
		[status, image, x, y, actualWidth, actualHeight]
	)

	const shapeParams = useMemo(
		() => ({ zIndex, opacity, box: boundingBox }),
		[zIndex, opacity, boundingBox]
	)

	useShape(draw, shapeParams)

	return null
}
