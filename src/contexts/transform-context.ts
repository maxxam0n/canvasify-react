import { createContext } from 'react'
import { Transform } from '../types'

export const TransformContext = createContext<Transform[]>([])
