import {
	useMemo,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
} from 'react'
import { LayerRegistryContext } from '../contexts/layer-registry-context'
import { LayerNameContext } from '../contexts/layer-name-context'
import { LayerRenderer } from '../types'

interface LayerProps extends PropsWithChildren {
	name: string
	opacity?: number
	zIndex?: number
	renderer?: LayerRenderer
}

export const Layer = ({
	name,
	children,
	renderer,
	opacity = 1,
	zIndex = 0,
}: LayerProps) => {
	const registry = useContext(LayerRegistryContext)

	if (!registry) {
		throw new Error('Ошибка регистрации слоя')
	}
	const { registerLayer, unregisterLayer } = registry

	const refCallback = useCallback(
		(canvasElement: HTMLCanvasElement | null) => {
			if (canvasElement) {
				registerLayer(name, canvasElement, opacity, renderer)
			}
		},
		[name, opacity, registerLayer, renderer]
	)

	useEffect(() => {
		return () => unregisterLayer(name)
	}, [name, unregisterLayer])

	return (
		<LayerNameContext.Provider value={name}>
			<canvas
				className="absolute top-0 left-0"
				ref={refCallback}
				style={useMemo(() => ({ zIndex }), [zIndex])}
			/>
			{children}
		</LayerNameContext.Provider>
	)
}
