import { createContext } from 'react'
import { ShapeDrawingData } from '../types'

interface CanvasContext {
	setShape: (shapeData: ShapeDrawingData) => void
	removeShape: (shapeData: ShapeDrawingData) => void
}

export const ShapeRegistryContext = createContext<CanvasContext | null>(null)
