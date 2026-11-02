/*==================== ABOUT 3D AVATAR ====================*/
// Avatar estilizado construido con geometría procedural a partir de la foto de perfil.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const canvas = document.getElementById('avatar-canvas')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let renderer
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
} catch (err) {
    canvas.closest('.about__photo').classList.add('is-fallback')
    throw err
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, 3 / 4, .1, 50)
camera.position.set(0, 1.6, 7.2)
camera.lookAt(0, 1.3, 0)

/*==================== HELPERS ====================*/
const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: .6, metalness: 0, ...opts })

const mesh = (geo, material, [x = 0, y = 0, z = 0] = [], [sx = 1, sy = 1, sz = 1] = []) => {
    const m = new THREE.Mesh(geo, material)
    m.position.set(x, y, z)
    m.scale.set(sx, sy, sz)
    return m
}

const C = {
    skin: '#c98b62',
    skinShade: '#b47750',
    hair: '#1b1512',
    shirt: '#1f1f25',
    jeans: '#2e3a5c',
    shoe: '#f3f1ee',
    sole: '#2a2a2e',
    eye: '#2b1a12',
    holo: '#4cc3ff'
}

const skin = mat(C.skin)
const hairMat = mat(C.hair, { roughness: .85 })
const shirt = mat(C.shirt, { roughness: .9 })

/*==================== LIGHTS ====================*/
scene.add(new THREE.HemisphereLight('#dff1ff', '#20306a', 1.4))

const key = new THREE.DirectionalLight('#fff3e6', 2.2)
key.position.set(2.5, 4, 5)
scene.add(key)

const rim = new THREE.DirectionalLight(C.holo, 2.4)
rim.position.set(-3, 3, -4)
scene.add(rim)

const under = new THREE.PointLight(C.holo, 6, 4, 1.5)
under.position.set(0, .3, .6)
scene.add(under)

/*==================== AVATAR ====================*/
const avatar = new THREE.Group()
scene.add(avatar)

// Piernas y zapatos
;[-.2, .2].forEach(x => {
    avatar.add(mesh(new THREE.CapsuleGeometry(.16, .38, 6, 16), mat(C.jeans), [x, .5]))
    avatar.add(mesh(new RoundedBoxGeometry(.28, .1, .46, 3, .05), mat(C.sole), [x, .05, .06]))
    avatar.add(mesh(new RoundedBoxGeometry(.26, .14, .4, 3, .07), mat(C.shoe), [x, .14, .05]))
})

// Cadera y torso (playera negra)
avatar.add(mesh(new RoundedBoxGeometry(.78, .26, .46, 4, .12), mat(C.jeans), [0, .82]))
const torso = mesh(new RoundedBoxGeometry(.92, .82, .54, 5, .22), shirt, [0, 1.25])
avatar.add(torso)
avatar.add(mesh(new THREE.CylinderGeometry(.13, .15, .2, 20), skin, [0, 1.7]))
avatar.add(mesh(new THREE.TorusGeometry(.15, .03, 8, 24), shirt, [0, 1.64], [1, 1, 1]).rotateX(Math.PI / 2))

// Brazos: hombro → codo → mano (para poder saludar)
const makeArm = side => {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * .5, 1.55, 0)
    shoulder.add(mesh(new THREE.SphereGeometry(.17, 20, 16), shirt, [0, -.02]))
    shoulder.add(mesh(new THREE.CapsuleGeometry(.14, .18, 6, 14), shirt, [0, -.2]))

    const elbow = new THREE.Group()
    elbow.position.y = -.38
    elbow.add(mesh(new THREE.CapsuleGeometry(.105, .26, 6, 14), skin, [0, -.15]))
    elbow.add(mesh(new THREE.SphereGeometry(.12, 16, 14), skin, [0, -.37], [1, 1.1, .85]))
    shoulder.add(elbow)

    shoulder.rotation.z = side * .14
    shoulder.userData = { side, elbow }
    avatar.add(shoulder)
    return shoulder
}
const leftArm = makeArm(-1)
const rightArm = makeArm(1)

// Cabeza
const head = new THREE.Group()
head.position.y = 1.78
avatar.add(head)

const HEAD_Y = .5
head.add(mesh(new THREE.SphereGeometry(.56, 40, 32), skin, [0, HEAD_Y], [1, 1.02, .96]))
;[-1, 1].forEach(s => head.add(mesh(new THREE.SphereGeometry(.11, 16, 12), skin, [s * .55, HEAD_Y - .02, -.02], [.6, 1, .8])))

// Cabello corto con volumen arriba, como en la foto
head.add(mesh(new THREE.SphereGeometry(.59, 40, 24, 0, Math.PI * 2, 0, Math.PI * .36), hairMat, [0, HEAD_Y + .02, -.03]).rotateX(-.22))
head.add(mesh(new THREE.SphereGeometry(.585, 32, 24, Math.PI, Math.PI, 0, Math.PI * .66), hairMat, [0, HEAD_Y, -.03]))
const tuft = new THREE.IcosahedronGeometry(.2, 1)
;[[0, 1.06, .26, 1.05], [-.2, 1.02, .2, .9], [.2, 1.01, .22, .9], [.06, 1.1, .04, 1], [-.15, 1.05, -.12, .95], [.16, 1.03, -.1, .9], [-.34, .9, -.02, .7], [.35, .9, -.03, .7]].forEach(([x, y, z, s]) => {
    head.add(mesh(tuft, hairMat, [x, y, z], [s * 1.1, s * .75, s]))
})

// Cara
const eyes = []
;[-1, 1].forEach(s => {
    const eye = new THREE.Group()
    eye.position.set(s * .19, HEAD_Y + .04, .5)
    eye.add(mesh(new THREE.SphereGeometry(.075, 20, 16), mat(C.eye, { roughness: .3 }), [], [.85, 1.05, .45]))
    eye.add(mesh(new THREE.SphereGeometry(.022, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), [.02, .03, .035]))
    head.add(eye)
    eyes.push(eye)
    head.add(mesh(new RoundedBoxGeometry(.2, .045, .06, 2, .02), hairMat, [s * .2, HEAD_Y + .19, .49]).rotateZ(s * -.08))
})
head.add(mesh(new THREE.SphereGeometry(.055, 16, 12), mat(C.skinShade), [0, HEAD_Y - .06, .55], [1, .9, .8]))
head.add(mesh(new THREE.TorusGeometry(.11, .02, 8, 24, Math.PI), mat('#5a2a20'), [0, HEAD_Y - .17, .5]).rotateZ(Math.PI))
;[-1, 1].forEach(s => head.add(mesh(new THREE.SphereGeometry(.07, 12, 10), new THREE.MeshBasicMaterial({ color: '#e0866a', transparent: true, opacity: .35 }), [s * .32, HEAD_Y - .1, .44], [1, .6, .3])))

/*==================== HOLO PLATFORM ====================*/
const platform = new THREE.Group()
scene.add(platform)

platform.add(mesh(new THREE.CylinderGeometry(1.15, 1.25, .14, 64), mat('#0d2a6b', { emissive: '#0a2a7a', emissiveIntensity: .6, roughness: .4 }), [0, -.07]))
const glow = (r, t, o) => {
    const ring = mesh(new THREE.TorusGeometry(r, t, 12, 96), new THREE.MeshBasicMaterial({ color: C.holo, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false }))
    ring.rotation.x = Math.PI / 2
    return ring
}
platform.add(glow(1.18, .025, .95))
platform.add(glow(.95, .012, .5))
platform.add(glow(1.32, .008, .35))

const beam = mesh(
    new THREE.CylinderGeometry(1.0, 1.15, 3.2, 48, 1, true),
    new THREE.MeshBasicMaterial({ color: C.holo, transparent: true, opacity: .07, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    [0, 1.6]
)
platform.add(beam)

const scanRing = glow(.85, .012, .8)
platform.add(scanRing)

// Partículas que suben
const COUNT = 60
const positions = new Float32Array(COUNT * 3)
const speeds = []
for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2, r = .3 + Math.random() * .8
    positions.set([Math.cos(a) * r, Math.random() * 3, Math.sin(a) * r], i * 3)
    speeds.push(.2 + Math.random() * .5)
}
const particleGeo = new THREE.BufferGeometry()
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: C.holo, size: .04, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }))
platform.add(particles)

/*==================== RESIZE ====================*/
const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
}
new ResizeObserver(resize).observe(canvas)
resize()

/*==================== INTERACTION ====================*/
const look = new THREE.Vector2()
let spin = 0, spinVel = 0, dragging = false, lastX = 0, moved = 0
let waveStart = -10

const wave = () => { waveStart = clock.getElapsedTime() }

window.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect()
    look.x = THREE.MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2.2, -1, 1)
    look.y = THREE.MathUtils.clamp(((e.clientY - (r.top + r.height * .3)) / innerHeight) * 2, -1, 1)
    if (!dragging) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    moved += Math.abs(dx)
    spinVel = dx * .01
    spin += spinVel
})

canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; moved = 0 })
window.addEventListener('pointerup', () => {
    if (dragging && moved < 6) {
        wave()
        const toast = document.getElementById('toast')
        toast.textContent = '👋 ¡Hola! Soy Zair'
        toast.classList.add('is-visible')
        setTimeout(() => toast.classList.remove('is-visible'), 2000)
    }
    dragging = false
})

/*==================== LOOP ====================*/
const clock = new THREE.Clock()
let visible = false, greeted = false, nextBlink = 2

new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !greeted) { greeted = true; setTimeout(wave, 500) }
}, { threshold: .3 }).observe(canvas)

const tick = () => {
    requestAnimationFrame(tick)
    if (!visible || document.hidden) return
    const t = clock.getElapsedTime()

    if (!reduceMotion) {
        // Respiración y balanceo
        torso.scale.set(1 + Math.sin(t * 2) * .012, 1 + Math.sin(t * 2) * .02, 1)
        avatar.position.y = .02 + Math.sin(t * 2) * .01

        // Giro con arrastre e inercia
        if (!dragging) { spinVel *= .94; spin += spinVel; spin += (0 - spin) * .02 }
        avatar.rotation.y = spin + Math.sin(t * .6) * .08

        // La cabeza sigue al cursor
        head.rotation.y += (look.x * .55 - head.rotation.y) * .08
        head.rotation.x += (look.y * .25 - head.rotation.x) * .08

        // Parpadeo
        const blink = t > nextBlink && t < nextBlink + .14
        eyes.forEach(e => { e.scale.y = blink ? .1 : 1 })
        if (t > nextBlink + .14) nextBlink = t + 2 + Math.random() * 3

        // Saludo
        const w = t - waveStart
        const raise = w < 2.2 ? Math.sin(Math.min(w / 2.2, 1) * Math.PI) : 0
        rightArm.rotation.z = .14 + Math.min(raise * 1.6, 1) * 2.45
        rightArm.userData.elbow.rotation.z = raise > .5 ? Math.sin(w * 14) * .45 : 0
        leftArm.rotation.z = -.14 - Math.sin(t * 2) * .02

        // Holograma
        const s = (t * .5) % 1
        scanRing.position.y = s * 2.9
        scanRing.material.opacity = Math.sin(s * Math.PI) * .8
        beam.material.opacity = .06 + Math.sin(t * 3) * .015
        const pos = particleGeo.attributes.position
        for (let i = 0; i < COUNT; i++) {
            let y = pos.getY(i) + speeds[i] * .012
            if (y > 3) y = 0
            pos.setY(i, y)
        }
        pos.needsUpdate = true
    }

    renderer.render(scene, camera)
}
tick()
