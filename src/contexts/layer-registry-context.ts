import { createContext } from 'react'
import { LayerRenderer } from '../types'

interface LayerContext {
	registerLayer: (
		name: string,
		canvas: HTMLCanvasElement,
		opacity: number,
		renderer?: LayerRenderer
	) => void
	unregisterLayer: (name: string) => void
}

export const LayerRegistryContext = createContext<LayerContext | null>(null)
