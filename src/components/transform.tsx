import { useMemo } from 'react'
import { TransformContext } from '../contexts/transform-context'
import { useInheritedTransforms } from '../hooks/use-inherited-transforms'
import {
	RotationParams,
	ScaleParams,
	Transform,
	TranslateParams,
} from '../types'

interface TransformGroupProps extends React.PropsWithChildren {
	translate?: TranslateParams
	scale?: ScaleParams
	rotate?: RotationParams
}

export const TransformGroup = ({
	rotate: { angle, originX: rotateOriginX, originY: rotateOriginY } = {
		angle: 0,
	},
	scale: { scaleX, scaleY, originX: scaleOriginX, originY: scaleOriginY } = {
		scaleX: 1,
		scaleY: 1,
	},
	translate: { translateX, translateY } = {
		translateX: 0,
		translateY: 0,
	},
	children,
}: TransformGroupProps) => {
	const inherited = useInheritedTransforms()

	const summaryTranslate = useMemo<Transform>(() => {
		return {
			type: 'translate',
			translateX: translateX + inherited.translateX,
			translateY: translateY + inherited.translateY,
		}
	}, [translateX, translateY, inherited.translateX, inherited.translateY])

	const summaryScale = useMemo<Transform>(() => {
		return {
			type: 'scale',
			scaleX: scaleX * inherited.scaleX,
			scaleY: scaleY * inherited.scaleY,
			originX: scaleOriginX,
			originY: scaleOriginY,
		}
	}, [
		scaleX,
		scaleY,
		inherited.scaleX,
		inherited.scaleY,
		scaleOriginX,
		scaleOriginY,
	])

	const summaryRotate = useMemo<Transform>(() => {
		return {
			type: 'rotation',
			angle: angle + inherited.angle,
			originX: rotateOriginX,
			originY: rotateOriginY,
		}
	}, [angle, inherited.angle, rotateOriginX, rotateOriginY])

	const transforms = useMemo<Transform[]>(() => {
		return [summaryTranslate, summaryScale, summaryRotate]
	}, [summaryTranslate, summaryScale, summaryRotate])

	return (
		<TransformContext.Provider value={transforms}>
			{children}
		</TransformContext.Provider>
	)
}
