import { PropsWithChildren, useEffect, useRef } from 'react'
import { MeasureContext } from './measure-context'
import { MetricsCacheContext } from './metrics-cache-context'

export const MetricsProvider = ({ children }: PropsWithChildren) => {
	const metricsCache = useRef(new Map<string, TextMetrics>())
	const canvasMeasureRef = useRef<CanvasRenderingContext2D | null>(null)

	useEffect(() => {
		const canvas = document.createElement('canvas')
		canvasMeasureRef.current = canvas.getContext('2d')
	}, [])

	return (
		<MeasureContext.Provider value={canvasMeasureRef.current}>
			<MetricsCacheContext.Provider value={metricsCache.current}>
				{children}
			</MetricsCacheContext.Provider>
		</MeasureContext.Provider>
	)
}
