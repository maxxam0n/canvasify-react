import {
	PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react'
import {
	Layer,
	LayerRenderer,
	Layers,
	LayerShapes,
	ShapeDrawingData,
} from '../types'
import { MetricsProvider } from '../contexts/metricts-provider'
import { LayerRegistryContext } from '../contexts/layer-registry-context'
import { ShapeRegistryContext } from '../contexts/shape-registry-context'

interface CanvasProps extends PropsWithChildren {
	width?: number
	height?: number
	bgColor?: string
}

export const Canvas = ({
	children,
	height = 300,
	width = 500,
	bgColor = 'white',
}: CanvasProps) => {
	const layers = useRef<Layers>(new Map())

	const animationFrameId = useRef<number>(0)

	const initializeLayer = useCallback(
		(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
			if (canvas instanceof HTMLCanvasElement) {
				const dpr = window.devicePixelRatio || 1
				const logicalWidth = width
				const logicalHeight = height

				canvas.width = logicalWidth * dpr
				canvas.height = logicalHeight * dpr
				canvas.style.width = `${logicalWidth}px`
				canvas.style.height = `${logicalHeight}px`

				context.scale(dpr, dpr)
			}
		},
		[width, height]
	)

	const requestDrawLayer = useCallback(
		(layer: Layer) => {
			initializeLayer(layer.canvas, layer.ctx)
			layer.dirtyAreas = [{ x: 0, y: 0, width, height }]
		},
		[initializeLayer, width, height]
	)

	useEffect(() => {
		layers.current.forEach(requestDrawLayer)
	}, [width, height, requestDrawLayer])

	const drawShapes = (
		ctx: CanvasRenderingContext2D,
		shapes: LayerShapes,
		layerOpacity: number
	) => {
		const sortedShapes = Array.from(shapes.values()).sort(
			(a, b) => (a.shapeParams.zIndex || 0) - (b.shapeParams.zIndex || 0)
		)
		sortedShapes.forEach(({ draw, transform, shapeParams }) => {
			ctx.save()
			ctx.globalAlpha = layerOpacity * shapeParams.opacity
			transform(ctx)
			draw(ctx)
			ctx.restore()
		})
	}

	// --- Главный цикл отрисовки ---
	useEffect(() => {
		const redrawLoop = () => {
			animationFrameId.current = requestAnimationFrame(redrawLoop)

			layers.current.forEach(layer => {
				const { dirtyAreas, shapes, ctx, opacity } = layer
				if (dirtyAreas.length > 0) {
					const USE_DYRTY_APPROACH = false

					if (layer.renderer) {
						layer.renderer({ ...layer, drawShapes })
					} else if (USE_DYRTY_APPROACH) {
						// Пока что отрубил мод отрисовки грязных областей.
						// Сейчас он работает не стабильно:
						// Не учитывает трансформации
						// Не корректно работает с прозрачностью,
						// При большом количестве dirtyAreas, скорость отрисовки сильно снижается (выгода только при маленьком количестве)
						// Если какие либо фигуры входят,
						// но они в свою очередь могут закрывать другие фигуры, у которых z-индекс больше,
						// но которые не попали в грязную область
					} else {
						ctx.clearRect(0, 0, width, height)
						drawShapes(ctx, shapes, opacity)
					}
				}
				layer.dirtyAreas = []
			})
		}

		redrawLoop()

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current)
			}
		}
	}, [width, height])

	const setShape = useCallback((shapeData: ShapeDrawingData) => {
		const { id, layerName, shapeParams } = shapeData

		layers.current.forEach((layer, key) => {
			if (layer.shapes.has(id) && layerName !== key) {
				layer.shapes.delete(id)
				layer.dirtyAreas.push(shapeParams.box)
			}
			if (layerName === key) {
				layer.shapes.set(id, shapeData)
				layer.dirtyAreas.push(shapeParams.box)
			}
		})
	}, [])

	const removeShape = useCallback((shapeData: ShapeDrawingData) => {
		const { id, layerName, shapeParams } = shapeData

		const layer = layers.current.get(layerName)
		if (layer) {
			layer.shapes.delete(id)
			layer.dirtyAreas.push(shapeParams.box)
		}
	}, [])

	const contextValue = useMemo(
		() => ({ setShape, removeShape }),
		[setShape, removeShape]
	)

	const registerLayer = useCallback(
		(
			name: string,
			canvas: HTMLCanvasElement,
			opacity: number,
			renderer?: LayerRenderer
		) => {
			if (layers.current.has(name)) return

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				console.error(`Невозможно зарегестрировать слой ${name}`)
				return
			}
			const layer = {
				canvas,
				ctx,
				dirtyAreas: [],
				opacity,
				shapes: new Map(),
				renderer,
			}
			layers.current.set(name, layer)
			requestDrawLayer(layer)
		},
		[requestDrawLayer]
	)

	const unregisterLayer = useCallback((name: string) => {
		layers.current.delete(name)
	}, [])

	const layerRegistryValue = useMemo(
		() => ({
			registerLayer,
			unregisterLayer,
		}),
		[registerLayer, unregisterLayer]
	)

	const containerStyle = {
		width: `${width}px`,
		height: `${height}px`,
		backgroundColor: bgColor,
	}

	return (
		<MetricsProvider>
			<LayerRegistryContext.Provider value={layerRegistryValue}>
				<ShapeRegistryContext.Provider value={contextValue}>
					<div className="relative" style={containerStyle}>
						{children}
					</div>
				</ShapeRegistryContext.Provider>
			</LayerRegistryContext.Provider>
		</MetricsProvider>
	)
}
