import { createContext } from 'react'

interface GroupContext {
	zIndex?: number
	opacity?: number
}

export const GroupContext = createContext<GroupContext | null>(null)
