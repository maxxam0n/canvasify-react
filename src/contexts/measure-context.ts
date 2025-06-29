import { createContext } from 'react'

export const MeasureContext = createContext<CanvasRenderingContext2D | null>(
	null
)
