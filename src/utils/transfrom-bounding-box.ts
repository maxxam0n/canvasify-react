import { BoundingBox, Transform } from '../types'
interface Point {
	x: number
	y: number
}

export const applyTransformsToPoint = (
	point: Point,
	transforms: Transform[]
): Point => {
	let { x, y } = point

	let totalScaleX = 1,
		totalScaleY = 1,
		totalAngle = 0,
		totalTranslateX = 0,
		totalTranslateY = 0

	for (const t of transforms) {
		if (t.type === 'scale') {
			totalScaleX *= t.scaleX
			totalScaleY *= t.scaleY
		} else if (t.type === 'rotation') {
			totalAngle += t.angle
		} else if (t.type === 'translate') {
			// Важно! Перемещение нужно применять ПОСЛЕ масштабирования и поворота.
			// Поэтому мы просто аккумулируем их.
			totalTranslateX += t.translateX
			totalTranslateY += t.translateY
		}
	}

	// 2. Применяем scale
	x *= totalScaleX
	y *= totalScaleY

	// 3. Применяем rotate
	if (totalAngle !== 0) {
		const cos = Math.cos(totalAngle)
		const sin = Math.sin(totalAngle)
		const newX = x * cos - y * sin
		const newY = x * sin + y * cos
		x = newX
		y = newY
	}

	// 4. Применяем translate
	x += totalTranslateX
	y += totalTranslateY

	return { x, y }
}

export const getTransformedBoundingBox = (
	box: BoundingBox,
	transforms: Transform[]
): BoundingBox => {
	if (!transforms || transforms.length === 0) {
		return box // Если трансформаций нет, возвращаем как есть
	}

	const points: Point[] = [
		{ x: box.x, y: box.y },
		{ x: box.x + box.width, y: box.y },
		{ x: box.x + box.width, y: box.y + box.height },
		{ x: box.x, y: box.y + box.height },
	]

	const transformedPoints = points.map(p =>
		applyTransformsToPoint(p, transforms)
	)

	let minX = transformedPoints[0].x
	let maxX = transformedPoints[0].x
	let minY = transformedPoints[0].y
	let maxY = transformedPoints[0].y

	for (let i = 1; i < transformedPoints.length; i++) {
		minX = Math.min(minX, transformedPoints[i].x)
		maxX = Math.max(maxX, transformedPoints[i].x)
		minY = Math.min(minY, transformedPoints[i].y)
		maxY = Math.max(maxY, transformedPoints[i].y)
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	}
}
