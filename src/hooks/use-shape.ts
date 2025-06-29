import { useContext, useEffect, useId, useMemo } from 'react'
import { ShapeDrawingData, ShapeParams, ShapeRenderer } from '../types'
import { ShapeRegistryContext } from '../contexts/shape-registry-context'
import { LayerNameContext } from '../contexts/layer-name-context'
import { TransformContext } from '../contexts/transform-context'
import { GroupContext } from '../contexts/group-context'
import { getTransformedBoundingBox } from '../utils/transfrom-bounding-box'

export const useShape = (draw: ShapeRenderer, shapeParams: ShapeParams) => {
	const registry = useContext(ShapeRegistryContext)
	const layerName = useContext(LayerNameContext)
	const transforms = useContext(TransformContext)
	const groupParams = useContext(GroupContext)

	if (!registry || !layerName) {
		throw new Error(`Ошибка регистрации фигуры, отсутствует registry`)
	}

	const { removeShape, setShape } = registry
	const id = useId()

	const finalShapeParams = useMemo(() => {
		const { opacity: groupOpacity = 1, zIndex: groupZIndex = 0 } =
			groupParams ?? {}

		const finalOpacity = groupOpacity * shapeParams.opacity
		const finalZIndex = groupZIndex + shapeParams.zIndex

		const transformedBox = getTransformedBoundingBox(
			shapeParams.box,
			transforms
		)

		return {
			opacity: finalOpacity,
			zIndex: finalZIndex,
			box: transformedBox,
		}
	}, [shapeParams, groupParams, transforms])

	useEffect(() => {
		const prepareTransform = (ctx: CanvasRenderingContext2D) => {
			transforms.forEach(transform => {
				switch (transform.type) {
					case 'translate': {
						ctx.translate(transform.translateX, transform.translateY)
						break
					}
					case 'scale': {
						const { scaleX, scaleY, originX, originY } = transform
						if (originX !== undefined && originY !== undefined) {
							ctx.translate(originX, originY)
							ctx.scale(scaleX, scaleY)
							ctx.translate(-originX, -originY)
						} else {
							ctx.scale(scaleX, scaleY)
						}
						break
					}
					case 'rotation': {
						const { angle, originX, originY } = transform
						if (originX !== undefined && originY !== undefined) {
							ctx.translate(originX, originY)
							ctx.rotate(angle)
							ctx.translate(-originX, -originY)
						} else {
							ctx.rotate(angle)
						}
					}
				}
			})
		}

		const shapeData: ShapeDrawingData = {
			id,
			draw,
			transform: prepareTransform,
			layerName,
			shapeParams: finalShapeParams,
		}

		setShape(shapeData)

		return () => removeShape(shapeData)
	}, [
		id,
		layerName,
		finalShapeParams,
		transforms,
		setShape,
		removeShape,
		draw,
	])
}
