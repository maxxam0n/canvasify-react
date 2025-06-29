import { BoundingBox, LayerShapes, ShapeDrawingData } from '../types'

const doBoundingBoxesOverlap = (
	box1: BoundingBox,
	box2: BoundingBox
): boolean => {
	return (
		box1.x < box2.x + box2.width &&
		box1.x + box1.width > box2.x &&
		box1.y < box2.y + box2.height &&
		box1.y + box1.height > box2.y
	)
}

export const findDirtyShapes = (
	layerShapes: LayerShapes,
	dirtyAreas: BoundingBox[]
) => {
	const shapesToRedraw = new Map<string, ShapeDrawingData>()

	for (const [id, shape] of layerShapes) {
		for (const dirtyArea of dirtyAreas) {
			const shapeIsDirty = doBoundingBoxesOverlap(
				shape.shapeParams.box,
				dirtyArea
			)
			if (shapeIsDirty) {
				shapesToRedraw.set(id, shape)
				break
			}
		}
	}
	return shapesToRedraw
}
