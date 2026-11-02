/*==================== PARTICLE PORTRAIT ====================*/
// La foto se convierte en miles de partículas: se arman al entrar en pantalla,
// se apartan del cursor y se dispersan al hacer clic.
import * as THREE from 'three'

const canvas = document.getElementById('portrait-canvas')
const visual = document.getElementById('about-visual')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const fail = () => visual.classList.add('is-photo')

let renderer
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
} catch (err) {
    fail()
    throw err
}
if (reduceMotion) fail()

const dpr = Math.min(window.devicePixelRatio, 2)
renderer.setPixelRatio(dpr)

const scene = new THREE.Scene()
// Plano de trabajo: ancho 1, alto según la proporción del marco (4:5)
const H = 1.25
const camera = new THREE.OrthographicCamera(-.5, .5, H / 2, -H / 2, -10, 10)

/*==================== SAMPLE IMAGE ====================*/
const loadImage = src => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
})

const buildParticles = img => {
    const STEP = window.innerWidth < 700 ? 5 : 4
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, c.width, c.height)

    // La foto ocupa todo el ancho y se apoya en la base del marco
    const scale = 1 / img.width
    const imgH = img.height * scale
    const bottom = -H / 2

    const pos = [], col = [], rnd = [], scatter = []
    for (let y = 0; y < img.height; y += STEP) {
        for (let x = 0; x < img.width; x += STEP) {
            const i = (y * img.width + x) * 4
            if (data[i + 3] < 140) continue
            const px = x * scale - .5
            const py = bottom + imgH - y * scale
            pos.push(px, py, 0)
            col.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255)
            rnd.push(Math.random())
            const a = Math.random() * Math.PI * 2, r = .4 + Math.random() * .9
            scatter.push(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - .5) * 2)
        }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3))
    geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rnd, 1))
    geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatter, 3))
    return { geo, step: STEP * scale }
}

/*==================== SHADER ====================*/
const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(9, 9) },
    uForce: { value: 0 },
    uSize: { value: 1 }
}

const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */`
        attribute vec3 aColor;
        attribute float aRand;
        attribute vec3 aScatter;
        uniform float uTime, uProgress, uForce, uSize;
        uniform vec2 uMouse;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            // Cada partícula llega con un pequeño retraso propio
            float p = clamp((uProgress - aRand * .35) / .65, 0., 1.);
            p = 1. - pow(1. - p, 3.);
            vec3 pos = mix(aScatter, position, p);

            // Efecto lupa con onda alrededor del cursor (deforma sin abrir huecos)
            vec2 dir = pos.xy - uMouse;
            float d = length(dir);
            float push = smoothstep(.2, 0., d) * uForce;
            float wave = sin(d * 60. - uTime * 6.) * .5 + .5;
            pos.xy += dir * push * (.35 + wave * .15);
            pos.z += push * .3;

            // Respiración sutil
            pos.x += sin(uTime * 1.3 + aRand * 40.) * .0015;
            pos.y += cos(uTime * 1.1 + aRand * 30.) * .0015;

            vColor = aColor + push * wave * vec3(.12, .06, .02);
            vAlpha = mix(.0, 1., p);
            gl_PointSize = uSize * (.85 + aRand * .35) * (1. + push * .6);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
        }
    `,
    fragmentShader: /* glsl */`
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            vec2 c = gl_PointCoord - .5;
            float r = length(c);
            if (r > .5) discard;
            gl_FragColor = vec4(vColor, vAlpha * smoothstep(.5, .35, r));
        }
    `
})

let points, stepWorld = .004

/*==================== RESIZE ====================*/
const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    // Tamaño de punto en píxeles para que las partículas casi se toquen
    uniforms.uSize.value = stepWorld * w * dpr * 1.5
}
new ResizeObserver(resize).observe(canvas)

/*==================== INTERACTION ====================*/
const mouseTarget = new THREE.Vector2(9, 9)
let hovering = false, assembleStart = null

const toPlane = e => {
    const r = canvas.getBoundingClientRect()
    mouseTarget.set(((e.clientX - r.left) / r.width - .5), (.5 - (e.clientY - r.top) / r.height) * H)
}

visual.addEventListener('pointermove', e => { hovering = true; toPlane(e) })
visual.addEventListener('pointerleave', () => { hovering = false })
visual.addEventListener('click', () => {
    // Dispersar y volver a armar
    uniforms.uProgress.value = .25
    assembleStart = performance.now() - 250
})

/*==================== LOOP ====================*/
let visible = false
new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && assembleStart === null) assembleStart = performance.now()
}, { threshold: .25 }).observe(canvas)

const clock = new THREE.Clock()
const tick = () => {
    requestAnimationFrame(tick)
    if (!visible || document.hidden || !points) return

    uniforms.uTime.value = clock.getElapsedTime()
    if (assembleStart !== null) {
        uniforms.uProgress.value = Math.min((performance.now() - assembleStart) / 2400, 1)
    }
    uniforms.uMouse.value.lerp(mouseTarget, .18)
    uniforms.uForce.value += ((hovering ? 1 : 0) - uniforms.uForce.value) * .08

    renderer.render(scene, camera)
}

loadImage('assets/img/zair.webp').then(img => {
    const { geo, step } = buildParticles(img)
    stepWorld = step
    points = new THREE.Points(geo, material)
    scene.add(points)
    resize()
    visual.classList.add('has-particles')
    tick()
}).catch(fail)
