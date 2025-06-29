import { useState, useEffect, useContext } from 'react'
import { MeasureContext } from '../contexts/measure-context'
import { MetricsCacheContext } from '../contexts/metrics-cache-context'

export function useCachedTextMetrics(
	text: string,
	font: string
): TextMetrics | null {
	const cacheKey = `${font}_${text}`

	const measureCtx = useContext(MeasureContext)
	const cache = useContext(MetricsCacheContext)

	const [metrics, setMetrics] = useState<TextMetrics | null>(
		cache?.get(cacheKey) || null
	)

	useEffect(() => {
		if (measureCtx && cache && text && font) {
			if (!cache.has(cacheKey)) {
				measureCtx.font = font
				const newMetrics = measureCtx.measureText(text)
				cache.set(cacheKey, newMetrics)
				setMetrics(newMetrics)
			}
		}
	}, [text, font, measureCtx, cache, metrics, cacheKey])

	return metrics
}
