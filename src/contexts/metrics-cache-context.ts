import { createContext } from 'react'

type MetricsCache = Map<string, TextMetrics>

export const MetricsCacheContext = createContext<MetricsCache | null>(null)
