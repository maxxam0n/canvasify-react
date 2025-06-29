# @maxxam0n/canvasify-react

[![NPM Version](https://img.shields.io/npm/v/@maxxam0n/canvasify-react.svg)](https://www.npmjs.com/package/@maxxam0n/canvasify-react)
[![License](https://img.shields.io/npm/l/@maxxam0n/canvasify-react.svg)](https://github.com/maxxam0n/canvasify-react/blob/main/LICENSE)

**Canvasify React** — это легковесная декларативная библиотека для 2D-рендеринга в React, использующая HTML Canvas. Описывайте сложную графику, анимации и сцены с помощью привычных React-компонентов, а Canvasify-React эффективно отрисует их на холсте.

Идеально подходит для создания простых игр, инфографики, кастомных визуализаций и интерактивных элементов.

## ✨ Ключевые особенности

-  **Декларативный API:** Забудьте об императивных вызовах Canvas API. Описывайте вашу сцену так же, как вы описываете UI в React: `<Canvas><Layer><RectShape ... /></Layer></Canvas>`.
-  **Компонентная архитектура:** Вся графика — это компоненты. Создавайте сложные объекты, комбинируя простые фигуры.
-  **Система слоев:** Разделяйте статичный фон и динамический передний план с помощью `<Layer>` для оптимальной производительности. Каждый слой — это отдельный `<canvas>`.
-  **Вложенные трансформации:** Легко группируйте объекты с помощью `<Group>` и применяйте к ним трансформации (перемещение, масштабирование, вращение), которые наследуются дочерними элементами.
-  **Богатый набор фигур:** Включает в себя готовые компоненты для рендеринга прямоугольников, кругов, эллипсов, линий, полигонов, текста и изображений.
-  **Расширяемость:** Создавайте собственные кастомные фигуры с помощью хука `useShape` и полностью переопределяйте логику рендера слоя с помощью `renderer`.
-  **Легковесность:** Минимальное количество зависимостей и небольшой размер.

## 📚 Содержание

-  [Ключевые особенности](#-ключевые-особенности)
-  [Установка](#-установка)
-  [Быстрый старт](#-быстрый-старт)
-  [Основные концепции](#-основные-концепции)
-  [Продвинутое использование](#-продвинутое-использование)
   -  [Создание кастомных фигур с `useShape`](#создание-кастомных-фигур-с-useShape)
   -  [Кастомная функция рендера для слоя](#кастомная-функция-рендера-для-слоя)
-  [API (Основные компоненты)](#-api-основные-компоненты)
-  [Справочник по типам (API Reference)](#справочник-по-типам-api-reference)
-  [Участие в разработке](#-участие-в-разработке)
-  [Лицензия](#-лицензия)

## 🚀 Установка

```bash
npm install @maxxam0n/canvasify-react
```

или

```bash
yarn add @maxxam0n/canvasify-react
```

## 🎯 Быстрый старт

Вот простой пример, как нарисовать несколько фигур:

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
				{/* Простой синий прямоугольник */}
				<RectShape
					x={50}
					y={50}
					width={150}
					height={100}
					fillColor="royalblue"
				/>
			</Layer>

			<Layer name="foreground-shapes">
				{/* Круг с обводкой */}
				<CircleShape
					cx={300}
					cy={100}
					radius={40}
					fillColor="tomato"
					strokeColor="black"
					lineWidth={4}
				/>

				{/* Текстовая метка */}
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

## 📚 Основные концепции

### `<Canvas>`

Корневой компонент, который создает контейнер для всех слоев и управляет их размерами.

### `<Layer>`

Каждый `<Layer>` — это отдельный `<canvas>` элемент, расположенный абсолютно друг над другом. Это позволяет оптимизировать рендеринг: статичные фоновые элементы можно поместить на один слой, а динамические, часто меняющиеся объекты — на другой.

### Фигуры (Shapes)

Библиотека предоставляет набор компонентов для рисования примитивов, таких как `<RectShape>`, `<CircleShape>`, `<ImageShape>` и другие. Они не рендерят DOM-элементы, а вместо этого регистрируют свои инструкции по отрисовке в родительском слое `<Layer>`.

### Группировка и трансформации

Используйте компонент `<Group>`, чтобы сгруппировать несколько фигур и применить к ним общие трансформации. Для более сложных трансформаций, таких как вращение и масштабирование, используйте `<TransformGroup>`.

## 🛠️ Продвинутое использование

### Создание кастомных фигур с `useShape`

Если вам нужна фигура, которой нет в стандартном наборе, вы можете легко создать свою собственную с помощью хука `useShape`. Этот хук позволяет зарегистрировать любую функцию отрисовки в движке рендеринга.

```jsx
import React, { useCallback, useMemo } from 'react'
import { useShape, BoundingBox } from '@maxxam0n/canvasify-react'

// 1. Создаем компонент для кастомной фигуры
export const HeartShape = ({ x, y, size, ...shapeParams }) => {
	// 2. Описываем, как рисовать фигуру, с помощью Canvas API
	const draw = useCallback(
		ctx => {
			// ... логика рисования сердца ...
			ctx.beginPath()
			ctx.moveTo(x, y + size / 4)
			ctx.quadraticCurveTo(x, y, x + size / 4, y)
			// ... и так далее
			ctx.fillStyle = shapeParams.fillColor || 'red'
			ctx.fill()
		},
		[x, y, size, shapeParams.fillColor]
	)

	// 3. Вычисляем BoundingBox
	const boundingBox = useMemo(
		() => ({ x, y, width: size, height: size }),
		[x, y, size]
	)

	// 4. Регистрируем фигуру в движке
	useShape(draw, { ...shapeParams, box: boundingBox })

	return null
}
```

### Кастомная функция рендера для слоя

Для полного контроля над процессом отрисовки слоя, вы можете передать в `<Layer>` проп `renderer`. Это функция, которая будет вызываться на каждом кадре анимации вместо стандартного рендерера библиотеки. Это полезно для сложных оптимизаций (например, собственный алгоритм "грязных областей") или для применения эффектов ко всему слою.

Функция `renderer` получает объект со следующими свойствами:

-  `ctx`: Контекст `CanvasRenderingContext2D` данного слоя.
-  `shapes`: `Map` всех фигур, зарегистрированных на этом слое.
-  `dirtyAreas`: Массив "грязных областей", которые, по мнению движка, требуют перерисовки.
-  `opacity`: Общая прозрачность слоя.
-  `drawShapes`: **Важная утилита!** Это стандартная функция отрисовки фигур из библиотеки. Вы можете вызвать её, чтобы нарисовать все фигуры после выполнения своих кастомных операций.

**Пример: отрисовка сетки на фоне перед всеми фигурами.**

```jsx
import {
	Canvas,
	Layer,
	RectShape,
	LayerRenderer,
} from '@maxxam0n/canvasify-react'

// Определяем нашу кастомную функцию рендера
const gridRenderer: LayerRenderer = ({ ctx, shapes, opacity, drawShapes }) => {
	const { width, height } = ctx.canvas

	// 1. Полностью очищаем холст
	ctx.clearRect(0, 0, width, height)

	// 2. Рисуем кастомный фон (сетку)
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

	// 3. Вызываем стандартный рендерер, чтобы он нарисовал все фигуры поверх нашей сетки
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

## 📖 API (Основные компоненты)

### `<Canvas>`

| Prop      | Type     | Default   | Описание                  |
| :-------- | :------- | :-------- | :------------------------ |
| `width`   | `number` | `500`     | Ширина холста в пикселях. |
| `height`  | `number` | `300`     | Высота холста в пикселях. |
| `bgColor` | `string` | `"white"` | Цвет фона контейнера.     |

### `<Layer>`

| Prop       | Type            | Default      | Описание                                                     |
| :--------- | :-------------- | :----------- | :----------------------------------------------------------- |
| `name`     | `string`        | **required** | Уникальное имя слоя.                                         |
| `opacity`  | `number`        | `1`          | Прозрачность всего слоя (от 0 до 1).                         |
| `zIndex`   | `number`        | `0`          | CSS `z-index` для `<canvas>` элемента.                       |
| `renderer` | `LayerRenderer` | `undefined`  | Кастомная функция для полного контроля над рендерингом слоя. |

### `<RectShape>`

| Prop          | Type     | Default      | Описание                                          |
| :------------ | :------- | :----------- | :------------------------------------------------ |
| `x`           | `number` | `0`          | Координата X верхнего левого угла.                |
| `y`           | `number` | `0`          | Координата Y верхнего левого угла.                |
| `width`       | `number` | **required** | Ширина прямоугольника.                            |
| `height`      | `number` | **required** | Высота прямоугольника.                            |
| `fillColor`   | `string` | `undefined`  | Цвет заливки (например, `"red"` или `"#FF0000"`). |
| `strokeColor` | `string` | `undefined`  | Цвет обводки.                                     |
| `lineWidth`   | `number` | `1`          | Толщина линии обводки.                            |
| `opacity`     | `number` | `1`          | Индивидуальная прозрачность фигуры.               |
| `zIndex`      | `number` | `0`          | Порядок отрисовки внутри слоя.                    |

## Справочник по типам (API Reference)

В этом разделе описаны основные типы данных, используемые в ядре библиотеки **Canvasify React**.

### 1. Основные типы для рендеринга и геометрии

Это базовые "строительные блоки", описывающие геометрию и функции отрисовки.

#### `BoundingBox`

Описывает прямоугольную область (осе-ориентированный ограничивающий прямоугольник). Используется для определения границ фигуры для оптимизаций (например, обнаружения "грязных областей") и обработки событий.

```typescript
export type BoundingBox = {
	x: number
	y: number
	width: number
	height: number
}
```

| Свойство | Тип      | Описание                           |
| :------- | :------- | :--------------------------------- |
| `x`      | `number` | Координата X верхнего левого угла. |
| `y`      | `number` | Координата Y верхнего левого угла. |
| `width`  | `number` | Ширина прямоугольника.             |
| `height` | `number` | Высота прямоугольника.             |

---

#### `ShapeRenderer`

Функция, которая содержит непосредственные вызовы Canvas 2D API для отрисовки конкретной фигуры.

```typescript
export type ShapeRenderer = (ctx: CanvasRenderingContext2D) => void
```

-  **`ctx`**: Контекст `CanvasRenderingContext2D` того слоя, на котором должна быть нарисована фигура.

---

#### `PrepareTransform`

Функция, ответственная за применение трансформаций (перемещение, масштабирование, вращение) к контексту холста _перед_ отрисовкой фигуры.

```typescript
export type PrepareTransform = (ctx: CanvasRenderingContext2D) => void
```

-  **`ctx`**: Контекст, к которому будут применены `ctx.translate()`, `ctx.scale()` и т.д.

---

### 2. Структуры данных для фигур

Эти типы описывают, как отдельная фигура хранится и управляется внутри движка.

#### `ShapeParams`

Содержит метаданные фигуры, которые используются движком для управления рендерингом.

```typescript
export type ShapeParams = {
	zIndex: number
	opacity: number
	box: BoundingBox
}
```

| Свойство  | Тип           | Описание                                                                                         |
| :-------- | :------------ | :----------------------------------------------------------------------------------------------- |
| `zIndex`  | `number`      | Порядок отрисовки фигуры внутри слоя. Фигуры с большим `zIndex` рисуются поверх фигур с меньшим. |
| `opacity` | `number`      | Прозрачность фигуры (от 0 до 1).                                                                 |
| `box`     | `BoundingBox` | Ограничивающий прямоугольник фигуры.                                                             |

---

#### `ShapeDrawingData`

Основная структура данных, представляющая одну отрисовываемую сущность (фигуру) в движке.

```typescript
export type ShapeDrawingData = {
	draw: ShapeRenderer
	transform: PrepareTransform
	shapeParams: ShapeParams
	id: string
	layerName: string
}
```

| Свойство      | Тип                | Описание                                               |
| :------------ | :----------------- | :----------------------------------------------------- |
| `draw`        | `ShapeRenderer`    | Функция, которая непосредственно рисует фигуру.        |
| `transform`   | `PrepareTransform` | Функция, которая настраивает трансформации для фигуры. |
| `shapeParams` | `ShapeParams`      | Метаданные фигуры (`zIndex`, `opacity`, `box`).        |
| `id`          | `string`           | Уникальный ID фигуры, генерируемый React (`useId`).    |
| `layerName`   | `string`           | Имя слоя, к которому принадлежит эта фигура.           |

---

#### `LayerShapes`

`Map`, который хранит все фигуры (`ShapeDrawingData`) на одном конкретном слое.

```typescript
export type LayerShapes = Map<string, ShapeDrawingData>
```

-  **Ключ**: `string` - Уникальный ID фигуры.
-  **Значение**: `ShapeDrawingData` - Полные данные для отрисовки этой фигуры.

---

### 3. Типы для трансформаций

Эти типы используются для декларативного описания трансформаций в компоненте `<TransformGroup>`.

#### `TransformType`

Строковый литерал, определяющий тип трансформации.

```typescript
export type TransformType = 'translate' | 'scale' | 'rotation'
```

---

#### `TranslateParams`, `ScaleParams`, `RotationParams`

Параметры для каждого типа трансформации.

```typescript
export type TranslateParams = { translateX: number; translateY: number }

export type ScaleParams = {
	scaleX: number
	scaleY: number
	originX?: number // Точка, относительно которой происходит масштабирование
	originY?: number
}

export type RotationParams = {
	angle: number // Угол в радианах
	originX?: number // Точка, относительно которой происходит вращение
	originY?: number
}
```

---

#### `Transform`

Размеченное объединение (discriminated union), которое представляет одну из возможных трансформаций. Свойство `type` используется для определения, какая именно трансформация применяется.

```typescript
export type Transform =
	| ({ type: 'translate' } & TranslateParams)
	| ({ type: 'scale' } & ScaleParams)
	| ({ type: 'rotation' } & RotationParams)
```

---

### 4. Структуры данных для слоев и сцены

Эти типы описывают состояние слоев и всей сцены в целом.

#### `LayerRenderer`

Тип для кастомной функции рендеринга, которая может быть передана в компонент `<Layer>`. Это позволяет полностью переопределить логику отрисовки для конкретного слоя.

```typescript
export type LayerRenderer = (layerData: {
	shapes: LayerShapes
	dirtyAreas: BoundingBox[]
	opacity: number
	ctx: CanvasRenderingContext2D
	drawShapes: (
		ctx: CanvasRenderingContext2D,
		shapes: LayerShapes,
		opacity: number
	) => void
}) => void
```

-  **`layerData`**: Объект, содержащий всё необходимое для рендеринга слоя. Включает контекст (`ctx`), все фигуры слоя (`shapes`), массив "грязных областей" (`dirtyAreas`), общую прозрачность (`opacity`) и **вспомогательную функцию `drawShapes`**, которая позволяет вызвать стандартный рендерер библиотеки.

---

#### `Layer`

Интерфейс, представляющий полное состояние одного слоя внутри движка.

```typescript
export interface Layer {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	opacity: number
	shapes: LayerShapes
	dirtyAreas: BoundingBox[]
	renderer?: LayerRenderer
}
```

---

#### `Layers`

`Map`, который хранит все объекты слоев (`Layer`) во всей сцене.

```typescript
export type Layers = Map<string, Layer>
```

-  **Ключ**: `string` - Уникальное имя слоя, заданное в пропсе `name` компонента `<Layer>`.
-  **Значение**: `Layer` - Объект, содержащий полное состояние слоя.

## 🤝 Участие в разработке

Мы всегда рады вашему вкладу! Если вы нашли ошибку или у вас есть идея для новой функции, пожалуйста, создайте [Issue](https://github.com/maxxam0n/canvasify-react/issues) или [Pull Request](https://github.com/maxxam0n/canvasify-react/pulls).

## 📄 Лицензия

Проект распространяется под лицензией [MIT](https://github.com/maxxam0n/canvasify-react/blob/main/LICENSE).
