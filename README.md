# @maxxam0n/canvasify-react

[![NPM Version](https://img.shields.io/npm/v/@maxxam0n/canvasify-react.svg)](https://www.npmjs.com/package/@maxxam0n/canvasify-react)
[![License](https://img.shields.io/npm/l/@maxxam0n/canvasify-react.svg)](https://github.com/maxxam0n/canvasify-react/blob/main/LICENSE)

**Canvasify React** is a lightweight, declarative 2D rendering library for React, powered by the HTML Canvas. Describe complex graphics, animations, and scenes using familiar React components, and let Canvasify React efficiently render them on the canvas.

Perfect for building simple games, infographics, custom data visualizations, and interactive elements.

## ✨ Key Features

-  **Declarative API:** Forget imperative Canvas API calls. Describe your scene just as you would describe your UI in React: `<Canvas><Layer><RectShape ... /></Layer></Canvas>`.
-  **Component-Based:** All graphics are components. Build complex objects by composing simple shapes.
-  **Layer System:** Separate static backgrounds from dynamic foregrounds using `<Layer>` for optimal performance. Each layer is a separate `<canvas>` element.
-  **Nested Transformations:** Easily group objects with `<Group>` and apply transformations (translation, scaling, rotation) that are inherited by child elements.
-  **Rich Shape Set:** Includes built-in components for rendering rectangles, circles, ellipses, lines, polygons, text, and images.
-  **Extensible:** Create your own custom shapes of any complexity with the `useShape` hook and completely override a layer's rendering logic with the `renderer` prop.
-  **Lightweight:** Minimal dependencies and a small bundle size.

## 📚 Table of Contents

-  [Key Features](#-key-features)
-  [Installation](#-installation)
-  [Quick Start](#-quick-start)
-  [Core Concepts](#-core-concepts)
-  [Advanced Usage](#️-advanced-usage)
   -  [Creating Custom Shapes with `useShape`](#creating-custom-shapes-with-useshape)
   -  [Custom Layer Renderer](#custom-layer-renderer)
-  [API (Core Components)](#-api-core-components)
-  [Contributing](#-contributing)
-  [License](#-license)

## 🚀 Installation

```bash
npm install @maxxam0n/canvasify-react
```

or via yarn:

```bash
yarn add @maxxam0n/canvasify-react
```

## 🎯 Quick Start

Here’s a simple example of how to draw a few shapes:

```jsx
import React from 'react'
import {
	Canvas,
	Layer,
	RectShape,
	CircleShape,
	TextShape,
} from '@maxxam0n/canvasify-react'

function MyScene() {
	return (
		<Canvas width={800} height={600} bgColor="#f4f4f8">
			<Layer name="background-shapes">
				{/* A simple blue rectangle */}
				<RectShape
					x={50}
					y={50}
					width={150}
					height={100}
					fillColor="royalblue"
				/>
			</Layer>

			<Layer name="foreground-shapes">
				{/* A circle with a stroke */}
				<CircleShape
					cx={300}
					cy={100}
					radius={40}
					fillColor="tomato"
					strokeColor="black"
					lineWidth={4}
				/>

				{/* A text label */}
				<TextShape
					x={50}
					y={200}
					text="Hello, Canvasify!"
					font="24px Arial"
					fillColor="#333"
				/>
			</Layer>
		</Canvas>
	)
}

export default MyScene
```

## 📚 Core Concepts

### `<Canvas>`

The root component that creates a container for all layers and manages their dimensions.

### `<Layer>`

Each `<Layer>` is a separate `<canvas>` element, positioned absolutely on top of each other. This allows for rendering optimizations: static background elements can be placed on one layer, while dynamic, frequently changing objects can be placed on another.

### Shapes

The library provides a set of components for drawing primitives, such as `<RectShape>`, `<CircleShape>`, `<ImageShape>`, and more. They do not render DOM elements; instead, they register their drawing instructions with their parent `<Layer>`.

### Grouping and Transformations

Use the `<Group>` component to group multiple shapes and apply common transformations to them. For more complex transformations like rotation and scaling, use `<TransformGroup>`.

## 🛠️ Advanced Usage

### Creating Custom Shapes with `useShape`

If you need a shape that isn't included in the standard set, you can easily create your own with the `useShape` hook. This hook allows you to register any drawing function with the rendering engine.

```jsx
import React, { useCallback, useMemo } from 'react'
import { useShape, BoundingBox } from '@maxxam0n/canvasify-react'

// 1. Define props for our new shape
interface HeartShapeProps {
	x: number;
	y: number;
	size: number;
	fillColor?: string;
	zIndex?: number;
}

// 2. Create the component
export const HeartShape = ({
	x,
	y,
	size,
	fillColor = 'red',
	...shapeParams
}: HeartShapeProps) => {
	// 3. Describe how to draw the shape using the Canvas API
	const draw = useCallback(
		(ctx: CanvasRenderingContext2D) => {
			ctx.beginPath()
			ctx.moveTo(x, y + size / 4)
			ctx.quadraticCurveTo(x, y, x + size / 4, y)
			ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4)
			// ... more drawing logic
			ctx.closePath()

			ctx.fillStyle = fillColor
			ctx.fill()
		},
		[x, y, size, fillColor]
	)

	// 4. Calculate the BoundingBox for optimizations
	const boundingBox =
		useMemo <
		BoundingBox >
		(() => ({
			x,
			y,
			width: size,
			height: size,
		}),
		[x, y, size])

	// 5. Register the shape with the engine using the useShape hook
	useShape(draw, { ...shapeParams, box: boundingBox })

	// The component renders nothing to the DOM
	return null
}

// Now you can use <HeartShape> inside a <Layer> just like any other shape!
```

### Custom Layer Renderer

For full control over a layer's rendering process, you can pass a `renderer` prop to `<Layer>`. This function will be called on every animation frame instead of the library's default renderer. This is useful for complex optimizations (like a custom dirty-region algorithm) or for applying effects to the entire layer.

The `renderer` function receives an object with the following properties:

-  `ctx`: The `CanvasRenderingContext2D` of the current layer.
-  `shapes`: A `Map` of all shapes registered on this layer.
-  `dirtyAreas`: An array of "dirty regions" that the engine suggests need redrawing.
-  `opacity`: The overall opacity of the layer.
-  `drawShapes`: **A crucial utility!** This is the library's standard shape-drawing function. You can call it to render all shapes after performing your custom operations.

**Example: Drawing a grid background before rendering any shapes.**

```jsx
import {
	Canvas,
	Layer,
	RectShape,
	LayerRenderer,
} from '@maxxam0n/canvasify-react'

// Define our custom renderer function
const gridRenderer: LayerRenderer = ({ ctx, shapes, opacity, drawShapes }) => {
	const { width, height } = ctx.canvas

	// 1. Completely clear the canvas
	ctx.clearRect(0, 0, width, height)

	// 2. Draw our custom background (a grid)
	ctx.strokeStyle = '#e0e0e0'
	ctx.lineWidth = 1
	for (let x = 0; x < width; x += 20) {
		ctx.beginPath()
		ctx.moveTo(x, 0)
		ctx.lineTo(x, height)
		ctx.stroke()
	}
	for (let y = 0; y < height; y += 20) {
		ctx.beginPath()
		ctx.moveTo(0, y)
		ctx.lineTo(width, y)
		ctx.stroke()
	}

	// 3. Call the default renderer to draw all shapes on top of our grid
	drawShapes(ctx, shapes, opacity)
}

function CustomRenderScene() {
	return (
		<Canvas width={800} height={600}>
			<Layer name="main" renderer={gridRenderer}>
				<RectShape
					x={40}
					y={40}
					width={100}
					height={60}
					fillColor="rgba(255, 0, 0, 0.7)"
				/>
			</Layer>
		</Canvas>
	)
}
```

## 📖 API (Core Components)

### `<Canvas>`

| Prop      | Type     | Default   | Description                                |
| :-------- | :------- | :-------- | :----------------------------------------- |
| `width`   | `number` | `500`     | The width of the canvas in pixels.         |
| `height`  | `number` | `300`     | The height of the canvas in pixels.        |
| `bgColor` | `string` | `"white"` | The background color of the container div. |

### `<Layer>`

| Prop       | Type            | Default      | Description                                                    |
| :--------- | :-------------- | :----------- | :------------------------------------------------------------- |
| `name`     | `string`        | **required** | A unique name for the layer.                                   |
| `opacity`  | `number`        | `1`          | The overall opacity of the layer (from 0 to 1).                |
| `zIndex`   | `number`        | `0`          | The CSS `z-index` for the `<canvas>` element.                  |
| `renderer` | `LayerRenderer` | `undefined`  | A custom function for full control over the layer's rendering. |

### `<RectShape>`

| Prop          | Type     | Default      | Description                                    |
| :------------ | :------- | :----------- | :--------------------------------------------- |
| `x`           | `number` | `0`          | The x-coordinate of the top-left corner.       |
| `y`           | `number` | `0`          | The y-coordinate of the top-left corner.       |
| `width`       | `number` | **required** | The width of the rectangle.                    |
| `height`      | `number` | **required** | The height of the rectangle.                   |
| `fillColor`   | `string` | `undefined`  | The fill color (e.g., `"red"` or `"#FF0000"`). |
| `strokeColor` | `string` | `undefined`  | The stroke color.                              |
| `lineWidth`   | `number` | `1`          | The width of the stroke line.                  |
| `opacity`     | `number` | `1`          | The individual opacity of the shape.           |
| `zIndex`      | `number` | `0`          | The rendering order within the layer.          |

\_Props for other shapes like `<CircleShape>` and `<TextShape>` follow a similar structure. For a complete list, please rely on your editor's autocompletion.

## 🤝 Contributing

Contributions are always welcome! If you find a bug or have an idea for a new feature, please create an [Issue](https://github.com/maxxam0n/canvasify-react/issues) or a [Pull Request](https://github.com/maxxam0n/canvasify-react/pulls).

## 📄 License

This project is licensed under the [MIT License](https://github.com/maxxam0n/canvasify-react/blob/main/LICENSE).
