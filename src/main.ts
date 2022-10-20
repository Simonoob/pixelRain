import './style.css'

const targetImage = new Image()
targetImage.src = '/targetImage.jpeg'
// targetImage.src = '/Creation-of-Adam.jpeg'
// targetImage.src = '/targetImage.webp'

const canvas = document.getElementById('targetCanvas')

class Particle {
	x: number
	y: number
	speed: number
	velocity: number
	size: number
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D | null
	brightnessMap: Array<
		Array<{ brightness: number; r: number; g: number; b: number }>
	>
	constructor(
		canvas: HTMLCanvasElement,
		brightnessMap: Array<
			Array<{ brightness: number; r: number; g: number; b: number }>
		>,
	) {
		this.canvas = canvas
		this.ctx = this.canvas.getContext('2d')
		this.x = Math.random() * this.canvas.width
		this.y = 0
		this.speed = 0
		this.velocity = Math.random() * 1.5
		this.size = Math.random() * 2.5
		this.brightnessMap = brightnessMap
	}

	update() {
		this.speed =
			this.brightnessMap[Math.floor(this.y)][
				Math.floor(this.x)
			].brightness
		const movement = 2.5 - this.speed + this.velocity
		this.y += movement
		if (this.y >= this.canvas.height) {
			this.y = 0
			this.x = Math.random() * this.canvas.width
		}
	}

	draw() {
		if (!this.ctx) return
		this.ctx.beginPath()
		const pixelInfo =
			this.brightnessMap[Math.floor(this.y)][Math.floor(this.x)]
		this.ctx.fillStyle = `rgb(${pixelInfo.r}, ${pixelInfo.g}, ${pixelInfo.b})`
		this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
		this.ctx.fill()
	}
}

const initParticles = (
	numberOfParticles: number,
	canvas: HTMLCanvasElement,
	brightnessMap: Array<
		Array<{ brightness: number; r: number; g: number; b: number }>
	>,
) => {
	let i = 0
	const particlesArray = []
	while (i < numberOfParticles) {
		i++
		particlesArray.push(new Particle(canvas, brightnessMap))
	}

	return particlesArray
}

const animate = (
	particlesArray: Array<Particle>,
	canvas: HTMLCanvasElement,
) => {
	const ctx = canvas.getContext('2d')
	if (!ctx) return

	ctx.globalAlpha = 0.1
	ctx.fillStyle = 'rgb(0,0,0)'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.globalAlpha = 0.5

	particlesArray.forEach(particle => {
		particle.update()
		ctx.globalAlpha = particle.speed * 0.3
		particle.draw()
	})

	window.requestAnimationFrame(() => animate(particlesArray, canvas))
}

const calculateRelativeBrightness = (
	red: number,
	green: number,
	blue: number,
) => {
	return (
		Math.sqrt(
			red * red * 0.299 + green * green * 0.587 + blue * blue * 0.114,
		) / 100
	)
}

const main = () => {
	targetImage.addEventListener('load', () => {
		if (!(canvas instanceof HTMLCanvasElement)) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.style.width = `${targetImage.width * window.devicePixelRatio} px`
		canvas.style.height = `${
			targetImage.height * window.devicePixelRatio
		} px`
		canvas.style.aspectRatio = `${targetImage.width}/${targetImage.height}`
		canvas.width = Math.min(targetImage.width)
		canvas.height = Math.min(targetImage.height)
		canvas.style.width = `${canvas.width} px`
		canvas.style.height = `${canvas.height} px`

		ctx.drawImage(targetImage, 0, 0, canvas.width, canvas.height)
		const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		let brightnessMap = []
		for (let y = 0; y < canvas.height; y++) {
			const row = []
			for (let x = 0; x < canvas.width; x++) {
				const selectedIndex = y * 4 * pixels.width + x * 4

				const red = pixels.data[selectedIndex]
				const green = pixels.data[selectedIndex + 1]
				const blue = pixels.data[selectedIndex + 2]
				const brightness = calculateRelativeBrightness(red, green, blue)
				row.push({ brightness, r: red, g: green, b: blue })
			}
			brightnessMap.push(row)
		}
		const particlesArray = initParticles(5000, canvas, brightnessMap)

		animate(particlesArray, canvas)
	})
}

main()
