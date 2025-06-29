export type BoundingBox = {
	x: number
	y: number
	width: number
	height: number
}

export type ShapeRenderer = (ctx: CanvasRenderingContext2D) => void

export type PrepareTransform = (ctx: CanvasRenderingContext2D) => void

export type LayerRenderer = (layerData: {
	shapes: LayerShapes
	dirtyAreas: BoundingBox[]
	opacity: number
	ctx: CanvasRenderingContext2D
	drawShapes: (
		ctx: CanvasRenderingContext2D,
		shapes: LayerShapes,
		opacity: number
	) => void
}) => void

export type ShapeParams = {
	zIndex: number
	opacity: number
	box: BoundingBox
}

export type ShapeDrawingData = {
	draw: ShapeRenderer
	transform: PrepareTransform
	shapeParams: ShapeParams
	id: string
	layerName: string
}

export type LayerShapes = Map<string, ShapeDrawingData>

export interface Layer {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	opacity: number
	shapes: LayerShapes
	dirtyAreas: BoundingBox[]
	renderer?: LayerRenderer
}

export type Layers = Map<string, Layer>

export type TransformType = 'translate' | 'scale' | 'rotation'

export type TranslateParams = {
	translateX: number
	translateY: number
}

export type ScaleParams = {
	scaleX: number
	scaleY: number
	originX?: number
	originY?: number
}

export type RotationParams = {
	angle: number
	originX?: number
	originY?: number
}

export type Transform =
	| ({ type: 'translate' } & TranslateParams)
	| ({ type: 'scale' } & ScaleParams)
	| ({ type: 'rotation' } & RotationParams)
