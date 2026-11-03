/*==================== HERO 3D SCENE ====================*/
// Escritorio de desarrollador construido con geometría procedural (sin modelos externos).
// Cada objeto interactivo lleva a algo real: proyectos en producción, estado de los servidores, hora local.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const canvas = document.getElementById('hero-canvas')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const ready = () => window.dispatchEvent(new Event('scene:ready'))

let renderer
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
} catch (err) {
    canvas.classList.add('is-fallback')
    ready()
    throw err
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(32, 1, .1, 100)
const world = new THREE.Group()
scene.add(world)

/*==================== HELPERS ====================*/
const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: .75, metalness: 0, ...opts })
const rbox = (w, h, d, r = .04, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r)

const mesh = (geo, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, material)
    m.position.set(x, y, z)
    m.rotation.set(rx, ry, rz)
    m.castShadow = cast
    m.receiveShadow = receive
    return m
}

// Cada pieza se agrega con animación de entrada "pop"
const pieces = []
const addPiece = (obj, parent = world) => {
    obj.userData.baseScale = obj.scale.clone()
    obj.scale.setScalar(reduceMotion ? 1 : 0.0001)
    if (reduceMotion) obj.scale.copy(obj.userData.baseScale)
    parent.add(obj)
    pieces.push(obj)
    return obj
}

const t = key => window.i18n ? window.i18n.t(key) : key

const COLORS = {
    cream: '#fbfcfa',
    wood: '#d9a066',
    woodDark: '#b97f47',
    dark: '#34343f',
    darker: '#25252d',
    orange: '#ff5f3a',
    yellow: '#f1c97a',
    rug1: '#0b6e66',
    rug2: '#3fa597',
    rug3: '#cfe7e1',
    green: '#5fae5a',
    greenDark: '#3f8f45',
    terracotta: '#d9774b',
    navy: '#0e3b40',
    cork: '#c99a68'
}

/*==================== LIGHTS ====================*/
const hemi = new THREE.HemisphereLight('#f6fbf9', '#cfe0da', 1.6)
scene.add(hemi)

const sun = new THREE.DirectionalLight('#fff1dd', 2.2)
sun.position.set(4, 8, 5)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.left = -6
sun.shadow.camera.right = 6
sun.shadow.camera.top = 6
sun.shadow.camera.bottom = -6
sun.shadow.radius = 6
sun.shadow.bias = -0.0005
scene.add(sun)

const lampLight = new THREE.PointLight('#ffb36b', 0, 4, 1.6)
scene.add(lampLight)

/*==================== FLOOR ====================*/
const shadowCatcher = mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .12 }), { rx: -Math.PI / 2, cast: false })
world.add(shadowCatcher)

const rug = new THREE.Group()
rug.add(mesh(rbox(6.2, .06, 4.6, .03), mat(COLORS.rug1), { y: .03, cast: false }))
rug.add(mesh(rbox(5.2, .06, 3.7, .03), mat(COLORS.rug2), { y: .05, cast: false }))
rug.add(mesh(rbox(4.2, .06, 2.8, .03), mat(COLORS.rug3), { y: .07, cast: false }))
addPiece(rug)

/*==================== SHAPE HELPERS ====================*/
// Perfil [radio, altura] girado sobre el eje Y (tazas, macetas, pantallas de lámpara)
const lathe = (pts, seg = 32) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

// Deforma una geometría vértice por vértice para lograr curvas suaves sin modelos externos
const bend = (geo, fn) => {
    const p = geo.attributes.position, v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i)
        fn(v)
        p.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    return geo
}

// Cilindro entre dos puntos (brazos de lámpara, soportes)
const rod = (a, b, r, material) => {
    const d = new THREE.Vector3().subVectors(b, a)
    const m = mesh(new THREE.CylinderGeometry(r, r, d.length(), 12), material)
    m.position.copy(a).add(b).multiplyScalar(.5)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
    return m
}

const metal = mat('#a7adb5', { roughness: .3, metalness: .45 })
const plastic = mat('#2a2a31', { roughness: .55 })

/*==================== DESK ====================*/
const DESK_Y = 1.45
const TOP = DESK_Y + .07
const desk = new THREE.Group()
desk.add(mesh(rbox(3.8, .1, 1.6, .045), mat(COLORS.cream, { roughness: .55 }), { y: DESK_Y + .02 }))
desk.add(mesh(rbox(3.7, .06, 1.5, .025), mat(COLORS.wood), { y: DESK_Y - .05 }))
// Patas torneadas, un poco abiertas hacia el piso
;[[-1.72, -.62], [1.72, -.62], [-1.72, .62], [1.72, .62]].forEach(([x, z]) => {
    const h = DESK_Y - .08
    desk.add(mesh(new THREE.CylinderGeometry(.055, .035, h, 18), mat(COLORS.wood), { x, y: h / 2, z, rx: -Math.sign(z) * .04, rz: Math.sign(x) * .04 }))
    desk.add(mesh(new THREE.CylinderGeometry(.042, .042, .025, 18), mat(COLORS.woodDark), { x: x + Math.sign(x) * .028, y: .012, z: z + Math.sign(z) * .028 }))
})
desk.add(mesh(rbox(3.3, .12, .04, .015), mat(COLORS.wood), { y: DESK_Y - .14, z: -.68 }))
desk.add(mesh(rbox(1.4, .05, .18, .015), plastic, { y: DESK_Y - .2, z: -.55 }))
addPiece(desk)

// Cajonera bajo el lado izquierdo
const drawers = new THREE.Group()
drawers.add(mesh(rbox(.62, .9, 1.1, .03), mat(COLORS.cream, { roughness: .6 }), { y: .52 }))
;[.82, .54, .26].forEach(y => {
    drawers.add(mesh(rbox(.56, .24, .03, .012, 2), mat(COLORS.wood), { y: y + .02, z: .555 }))
    drawers.add(mesh(rbox(.16, .025, .03, .012, 2), mat(COLORS.navy), { y: y + .08, z: .58 }))
})
;[[-.26, -.48], [.26, -.48], [-.26, .48], [.26, .48]].forEach(([x, z]) => {
    drawers.add(mesh(new THREE.CylinderGeometry(.03, .03, .07, 12), plastic, { x, y: .035, z }))
})
drawers.position.set(-1.25, 0, .02)
addPiece(drawers)

/*==================== PROJECT SCREENS ====================*/
// Las pantallas muestran capturas reales de cada proyecto, con barra de navegador y estado en vivo
const loadImage = src => new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
})

const makeScreen = (w, h, opts) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    const screen = { c, ctx: c.getContext('2d'), tex, img: null, hover: false, status: null, ...opts }
    loadImage(opts.src).then(img => { screen.img = img; drawScreen(screen) })
    return screen
}

const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
}

const drawScreen = s => {
    const { ctx, c } = s
    const bar = s.chrome ? Math.round(c.height * .075) : 0
    ctx.fillStyle = '#16181d'
    ctx.fillRect(0, 0, c.width, c.height)

    if (s.img) {
        // Recorte tipo "cover" anclado arriba
        const ratio = Math.max(c.width / s.img.width, (c.height - bar) / s.img.height)
        const w = s.img.width * ratio, h = s.img.height * ratio
        ctx.drawImage(s.img, (c.width - w) / 2, bar, w, h)
    }

    if (s.chrome) {
        ctx.fillStyle = '#eceff1'
        ctx.fillRect(0, 0, c.width, bar)
        ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
            ctx.fillStyle = col
            ctx.beginPath()
            ctx.arc(bar * .6 + i * bar * .5, bar / 2, bar * .14, 0, Math.PI * 2)
            ctx.fill()
        })
        ctx.fillStyle = '#ffffff'
        roundRect(ctx, bar * 2.3, bar * .18, c.width * .55, bar * .64, bar * .32)
        ctx.fill()
        ctx.fillStyle = '#4b5563'
        ctx.font = `600 ${Math.round(bar * .36)}px Inter, sans-serif`
        ctx.textBaseline = 'middle'
        ctx.fillText('🔒 ' + s.url, bar * 2.6, bar / 2 + 1)

        {
            const online = s.status === true
            const label = online ? t('desk.online') : s.status === false ? t('desk.offline') : t('desk.checking')
            ctx.font = `700 ${Math.round(bar * .36)}px Inter, sans-serif`
            const tw = ctx.measureText(label).width
            const x = c.width - tw - bar * 1.3
            ctx.fillStyle = online ? '#16a36a' : s.status === false ? '#ff5f3a' : '#9ca3af'
            ctx.beginPath()
            ctx.arc(x - bar * .3, bar / 2, bar * .14, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#111827'
            ctx.fillText(label, x, bar / 2 + 1)
        }
    }

    if (s.locked) {
        ctx.fillStyle = 'rgba(8, 18, 20, .55)'
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `${Math.round(c.height * .16)}px sans-serif`
        ctx.fillText('🔒', c.width / 2, c.height * .42)
        ctx.font = `700 ${Math.round(c.height * .075)}px Inter, sans-serif`
        ctx.fillText(t('desk.private'), c.width / 2, c.height * .62)
        ctx.textAlign = 'left'
    }

    if (s.hover) {
        ctx.fillStyle = 'rgba(11, 110, 102, .35)'
        ctx.fillRect(0, bar, c.width, c.height - bar)
        const label = t('desk.open')
        ctx.font = `700 ${Math.round(c.height * .07)}px Inter, sans-serif`
        const tw = ctx.measureText(label).width + c.height * .12
        const h = c.height * .14
        ctx.fillStyle = '#ff5f3a'
        roundRect(ctx, (c.width - tw) / 2, (c.height + bar - h) / 2, tw, h, h / 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, c.width / 2, (c.height + bar) / 2 + 1)
        ctx.textAlign = 'left'
    }

    s.tex.needsUpdate = true
}

const screens = {
    fiskality: makeScreen(1024, 585, { src: 'assets/img/fiskality.webp', url: 'fiskality.com', chrome: true }),
    presto: makeScreen(1024, 585, { src: 'assets/img/presto.webp', url: 'presto-plus · préstamos', chrome: true }),
    sgse: makeScreen(768, 560, { src: 'assets/img/sgse.webp', locked: true })
}

const screenMat = tex => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })

const makeMonitor = (screen, x, ry) => {
    const g = new THREE.Group()
    const shell = mat(COLORS.darker, { roughness: .4 })
    g.add(mesh(rbox(.52, .025, .3, .012), metal, { y: TOP + .013, z: -.06 }))
    g.add(mesh(rbox(.085, .62, .035, .015), metal, { y: TOP + .33, z: -.14, rx: .1 }))
    g.add(mesh(rbox(.6, .4, .08, .035), shell, { y: TOP + .8, z: -.06 }))
    g.add(mesh(rbox(1.46, .88, .045, .022), shell, { y: TOP + .8 }))
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .8), screenMat(screen.tex))
    plane.position.set(0, TOP + .815, .024)
    g.add(plane)
    // LED de encendido en el marco inferior
    g.add(mesh(new THREE.CircleGeometry(.009, 12), new THREE.MeshBasicMaterial({ color: '#2ec4b0', toneMapped: false }), { x: .64, y: TOP + .385, z: .024, cast: false }))
    g.position.set(x, 0, -.38)
    g.rotation.y = ry
    g.userData.screen = plane
    return g
}

const monitorLeft = addPiece(makeMonitor(screens.fiskality, -.82, .22))
const monitorRight = addPiece(makeMonitor(screens.presto, .82, -.22))

/*==================== TABLET (SGSE) ====================*/
const tablet = new THREE.Group()
tablet.add(mesh(rbox(.34, .03, .24, .015), metal, { y: TOP + .015, z: .02 }))
tablet.add(mesh(rbox(.05, .26, .03, .012), metal, { y: TOP + .13, z: -.05, rx: -.35 }))
const tabletBody = new THREE.Group()
tabletBody.add(mesh(rbox(.62, .46, .028, .03), mat(COLORS.darker, { roughness: .4 }), {}))
const tabletScreen = new THREE.Mesh(new THREE.PlaneGeometry(.57, .41), screenMat(screens.sgse.tex))
tabletScreen.position.z = .0145
tabletBody.add(tabletScreen)
tabletBody.position.set(0, TOP + .27, 0)
tabletBody.rotation.x = -.32
tablet.add(tabletBody)
tablet.position.set(-.98, 0, .3)
tablet.rotation.y = .35
tablet.userData.screen = tabletScreen
addPiece(tablet)

/*==================== KEYBOARD & MOUSE ====================*/
// Distribución real: teclas anchas a los lados y barra espaciadora en el color de acento
const keyboard = new THREE.Group()
keyboard.add(mesh(rbox(1.16, .045, .37, .02), mat('#e9e2d8', { roughness: .6 }), { y: TOP + .022 }))
const U = .075
const rows = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75],
    [1.5, 1.25, 1.25, 5.75, 1.25, 1.25, 1, 1.25]
]
const keys = new THREE.InstancedMesh(rbox(U - .012, .03, U - .012, .012, 2), mat('#ffffff', { roughness: .5 }), rows.flat().length)
const dummy = new THREE.Object3D()
const keyColor = new THREE.Color()
let k = 0
rows.forEach((row, r) => {
    let acc = 0
    row.forEach((w, c) => {
        dummy.position.set(-rows[0].reduce((a, b) => a + b) * U / 2 + (acc + w / 2) * U, TOP + .058, -.12 + r * U)
        dummy.scale.set((w * U - .012) / (U - .012), 1, 1)
        dummy.updateMatrix()
        keys.setMatrixAt(k, dummy.matrix)
        keys.setColorAt(k++, keyColor.set(w > 4 ? COLORS.orange : r === 0 && c === 0 ? '#2ec4b0' : w > 1 ? '#cfd6d4' : '#ffffff'))
        acc += w
    })
})
keys.castShadow = true
keyboard.add(keys)
keyboard.position.set(.08, 0, .32)
addPiece(keyboard)

const mouse = new THREE.Group()
mouse.add(mesh(rbox(.44, .012, .38, .01, 2), mat(COLORS.navy, { roughness: .95 }), { y: TOP + .006, cast: false }))
const mouseBody = mesh(new THREE.SphereGeometry(.1, 28, 18), mat('#ffffff', { roughness: .4 }), { y: TOP + .014 })
mouseBody.scale.set(.6, .4, 1)
mouse.add(mouseBody)
mouse.add(mesh(new THREE.CylinderGeometry(.013, .013, .012, 14), plastic, { y: TOP + .052, z: -.04, rz: Math.PI / 2 }))
mouse.position.set(.88, 0, .36)
mouse.rotation.y = .15
addPiece(mouse)

/*==================== MUG WITH STEAM ====================*/
const mug = new THREE.Group()
const mugMat = mat(COLORS.orange, { roughness: .35, side: THREE.DoubleSide })
mug.add(mesh(new THREE.CylinderGeometry(.14, .14, .012, 28), mat(COLORS.cork, { roughness: .95 }), { y: TOP + .006 }))
mug.add(mesh(lathe([[0, 0], [.095, 0], [.108, .015], [.115, .24], [.107, .245], [.1, .24], [.094, .03], [0, .03]]), mugMat, { y: TOP + .012 }))
mug.add(mesh(new THREE.TorusGeometry(.062, .018, 12, 24, Math.PI), mugMat, { x: .112, y: TOP + .14, rz: -Math.PI / 2 }))
mug.add(mesh(new THREE.CircleGeometry(.1, 28), mat('#5a321a', { roughness: .2 }), { y: TOP + .215, rx: -Math.PI / 2, cast: false }))
mug.position.set(1.45, 0, .25)
addPiece(mug)

const steam = Array.from({ length: 3 }, (_, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }))
    s.userData.offset = i / 3
    mug.add(s)
    return s
})

/*==================== PLANTS ====================*/
// "snake": lengua de suegra con hojas largas; "trailing": potus con guías que cuelgan
const leafGeo = new THREE.SphereGeometry(1, 14, 10)
const makePlant = (scale = 1, type = 'snake', blades = 8, tall = 1) => {
    const g = new THREE.Group()
    g.add(mesh(lathe([[0, 0], [.12, 0], [.155, .25], [.178, .255], [.178, .3], [.158, .3], [.152, .27]], 28), mat(COLORS.terracotta, { roughness: .85, side: THREE.DoubleSide })))
    g.add(mesh(new THREE.CylinderGeometry(.153, .153, .02, 24), mat('#4a3122', { roughness: 1 }), { y: .27, cast: false }))
    const greens = [COLORS.green, COLORS.greenDark, '#79c26a']

    if (type === 'snake') {
        for (let i = 0; i < blades; i++) {
            const a = i / blades * Math.PI * 2 + .4, h = (.13 + ((i * 7) % 5) * .025) * tall, tilt = .1 + (i % 3) * .09
            const pivot = new THREE.Group()
            pivot.position.y = .27
            pivot.rotation.set(tilt, a, 0, 'YXZ')
            const leaf = mesh(leafGeo, mat(greens[i % 3], { roughness: .55 }), { y: h, ry: (i % 2) * .6 })
            leaf.scale.set(.048 * (1 + (tall - 1) * .3), h, .012)
            pivot.add(leaf)
            g.add(pivot)
        }
    } else {
        ;[[0, .34, 0], [.07, .32, .05], [-.07, .33, -.03], [.03, .38, -.06], [-.04, .37, .06]].forEach(([x, y, z], i) => {
            const bush = mesh(leafGeo, mat(greens[i % 3], { roughness: .6 }), { x, y, z, ry: i })
            bush.scale.set(.09, .05, .08)
            g.add(bush)
        })
        // Guías que caen por el frente de la repisa
        const vineMat = mat(COLORS.greenDark)
        ;[-.09, .02, .11].forEach((x0, v) => {
            const len = .45 + v * .15
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(x0, .3, .08), new THREE.Vector3(x0 + .03, .27, .26),
                new THREE.Vector3(x0 + .06, .05, .32), new THREE.Vector3(x0 + .02, .3 - len - .1, .3)
            ])
            g.add(mesh(new THREE.TubeGeometry(curve, 24, .006, 5), vineMat, { cast: false }))
            for (let t = .15; t <= 1; t += .12) {
                const p = curve.getPoint(t)
                const leaf = mesh(leafGeo, mat(greens[(v + Math.round(t * 10)) % 3], { roughness: .6 }), { x: p.x + (t * 10 % 2 ? .025 : -.025), y: p.y, z: p.z + .015, rx: .9, ry: t * 7 })
                leaf.scale.set(.045, .012, .035)
                g.add(leaf)
            }
        })
    }
    g.scale.setScalar(scale)
    return g
}

const deskPlant = makePlant(.8)
deskPlant.position.set(1.66, TOP, -.6)
addPiece(deskPlant)

const floorPlant = makePlant(1.9, 'snake', 13, 1.9)
floorPlant.position.set(2.45, .08, -.6)
addPiece(floorPlant)

/*==================== BOOKS ====================*/
// Libro acostado: tapas, lomo al frente y bloque de páginas
const pagesMat = mat('#f4efe3', { roughness: .9 })
const makeBook = (w, t, d, color) => {
    const g = new THREE.Group(), cover = mat(color, { roughness: .6 }), c = .012
    g.add(mesh(rbox(w, c, d, .005, 2), cover, { y: (t - c) / 2 }))
    g.add(mesh(rbox(w, c, d, .005, 2), cover, { y: -(t - c) / 2 }))
    g.add(mesh(rbox(w, t, c * 1.4, .006, 2), cover, { z: (d - c * 1.4) / 2 }))
    g.add(mesh(new THREE.BoxGeometry(w - .016, t - c * 2, d - .02), pagesMat, { z: -.004 }))
    return g
}

const books = new THREE.Group()
;[[COLORS.navy, .42, .075, 0], ['#e85d4a', .38, .065, .1], [COLORS.yellow, .34, .06, -.06]].forEach(([color, w, t, r], i) => {
    const b = makeBook(w, t, .29 - i * .02, color)
    b.position.y = TOP + t / 2 + [0, .075, .14][i]
    b.rotation.y = r
    books.add(b)
})
books.position.set(-1.55, 0, .38)
addPiece(books)

/*==================== RUBBER DUCK ====================*/
const duck = new THREE.Group()
const duckMat = mat('#ffd23f', { roughness: .35 })
duck.add(mesh(new THREE.SphereGeometry(.11, 24, 18), duckMat, { y: .09 }))
duck.children[0].scale.set(1, .82, 1.2)
duck.add(mesh(new THREE.SphereGeometry(.075, 24, 18), duckMat, { y: .22, z: .05 }))
duck.add(mesh(new THREE.ConeGeometry(.05, .12, 14), duckMat, { y: .15, z: -.12, rx: -1.05 }))
;[-1, 1].forEach(s => {
    const wing = mesh(new THREE.SphereGeometry(.06, 16, 12), duckMat, { x: s * .1, y: .1, z: -.01, rz: s * .3 })
    wing.scale.set(.35, .7, 1.2)
    duck.add(wing)
    duck.add(mesh(new THREE.SphereGeometry(.013, 10, 10), mat('#222', { roughness: .2 }), { x: s * .035, y: .245, z: .115 }))
})
const beak = mesh(new THREE.SphereGeometry(.04, 16, 10), mat(COLORS.orange), { y: .21, z: .125 })
beak.scale.set(1, .4, 1.1)
duck.add(beak)
duck.position.set(1.22, TOP, .02)
duck.rotation.y = -.5
addPiece(duck)

/*==================== DESK LAMP ====================*/
// Lámpara de arquitecto: base, dos brazos con articulaciones y pantalla abierta
const lamp = new THREE.Group()
const lampMat = mat(COLORS.navy, { roughness: .4 })
const jointMat = mat(COLORS.orange, { roughness: .4 })
lamp.add(mesh(lathe([[0, 0], [.16, 0], [.165, .025], [.12, .06], [0, .06]], 28), lampMat))
const lampA = new THREE.Vector3(0, .07, 0), lampB = new THREE.Vector3(.14, .62, 0), lampC = new THREE.Vector3(.5, .88, 0)
lamp.add(rod(lampA, lampB, .018, lampMat), rod(lampB, lampC, .018, lampMat))
lamp.add(rod(lampA.clone().add(new THREE.Vector3(.04, .02, 0)), lampB.clone().add(new THREE.Vector3(.04, -.03, 0)), .006, metal))
;[lampA, lampB, lampC].forEach(p => lamp.add(mesh(new THREE.SphereGeometry(.034, 14, 12), jointMat, { x: p.x, y: p.y })))
const lampHead = new THREE.Group()
lampHead.add(mesh(lathe([[.03, .08], [.055, .05], [.14, -.07], [.15, -.1]], 28), mat(COLORS.navy, { roughness: .4, side: THREE.DoubleSide })))
const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffe2b8' })
const bulb = mesh(new THREE.SphereGeometry(.05, 14, 12), bulbMat, { y: -.03, cast: false })
lampHead.add(bulb)
lampHead.position.copy(lampC)
lampHead.rotation.z = .7
lamp.add(lampHead)
lamp.position.set(-1.74, TOP, -.6)
lamp.rotation.y = -Math.PI / 2
addPiece(lamp)

/*==================== SERVER TOWER ====================*/
// Gabinete con panel de vidrio y ventiladores; los LEDs reflejan el estado real de los proyectos
const server = new THREE.Group()
server.add(mesh(rbox(.5, 1.0, .85, .04), mat(COLORS.dark, { roughness: .45 }), { y: .58 }))
server.add(mesh(rbox(.44, .94, .02, .01, 2), mat(COLORS.darker), { y: .58, z: .43, cast: false }))
const slotMat = mat('#16161b')
for (let i = 0; i < 9; i++) server.add(mesh(rbox(.014, .3, .01, .004, 2), slotMat, { x: -.13 + i * .033, y: .28, z: .442, cast: false }))
const leds = []
for (let i = 0; i < 5; i++) {
    const led = mesh(rbox(.3, .03, .015, .008, 2), new THREE.MeshBasicMaterial({ color: '#9ca3af' }), { y: .58 + i * .065, z: .445, cast: false })
    led.userData.phase = Math.random() * 10
    leds.push(led)
    server.add(led)
}
server.add(mesh(new THREE.TorusGeometry(.026, .006, 8, 24), new THREE.MeshBasicMaterial({ color: '#2ec4b0', toneMapped: false }), { y: .98, z: .445, cast: false }))
// Ventiladores iluminados detrás del vidrio lateral
const fans = [.36, .76].map(y => {
    const fan = new THREE.Group()
    fan.add(mesh(new THREE.TorusGeometry(.13, .014, 10, 32), new THREE.MeshBasicMaterial({ color: '#2ec4b0', toneMapped: false }), { cast: false }))
    for (let i = 0; i < 5; i++) fan.add(mesh(rbox(.1, .035, .008, .004, 2), mat('#3c3c46'), { x: Math.cos(i / 5 * Math.PI * 2) * .06, y: Math.sin(i / 5 * Math.PI * 2) * .06, rz: i / 5 * Math.PI * 2 + .5, cast: false }))
    fan.position.set(.21, y, 0)
    fan.rotation.y = Math.PI / 2
    server.add(fan)
    return fan
})
server.add(mesh(rbox(.015, .86, .72, .01, 2), new THREE.MeshStandardMaterial({ color: '#9fe3d8', transparent: true, opacity: .22, roughness: .1 }), { x: .252, y: .58, cast: false, receive: false }))
;[[-.18, -.35], [.18, -.35], [-.18, .35], [.18, .35]].forEach(([x, z]) => server.add(mesh(new THREE.CylinderGeometry(.03, .035, .06, 12), plastic, { x, y: .05, z })))
server.position.set(1.25, .02, -.15)
addPiece(server)

/*==================== CHAIR ====================*/
// Silla de oficina negra inspirada en la Herman Miller Verus: respaldo de malla con marco,
// columna curva que une el asiento con el respaldo, brazos con altura ajustable y base de estrella
const chair = new THREE.Group()
const chairFrame = mat('#1b1d21', { roughness: .45 })
const chairMetal = mat('#4b5058', { roughness: .3, metalness: .5 })

// Malla de suspensión: tejido fino con marco grueso alrededor
const meshTexture = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#2a2d33'
    ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = 'rgba(0, 0, 0, .55)'
    ctx.lineWidth = 1
    for (let i = 0; i < 256; i += 5) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke()
    }
    ctx.strokeStyle = '#17181c'
    ctx.lineWidth = 22
    ctx.strokeRect(11, 11, 234, 234)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return tex
})()

// Base de estrella con rodajas dobles
for (let i = 0; i < 5; i++) {
    const leg = new THREE.Group()
    leg.add(mesh(rbox(.42, .055, .075, .022), chairFrame, { x: .2, y: .17, rz: -.12 }))
    leg.add(mesh(rbox(.05, .07, .07, .015, 2), chairFrame, { x: .39, y: .12 }))
    ;[-.03, .03].forEach(z => leg.add(mesh(new THREE.CylinderGeometry(.045, .045, .03, 18), mat('#111215', { roughness: .4 }), { x: .39, y: .05, z, rx: Math.PI / 2 })))
    leg.rotation.y = (i / 5) * Math.PI * 2 + .3
    chair.add(leg)
}
chair.add(mesh(new THREE.CylinderGeometry(.07, .08, .1, 18), chairFrame, { y: .17 }))

// Pistón y mecanismo
chair.add(mesh(new THREE.CylinderGeometry(.045, .045, .32, 16), chairFrame, { y: .37 }))
chair.add(mesh(new THREE.CylinderGeometry(.03, .03, .34, 16), chairMetal, { y: .66 }))
chair.add(mesh(rbox(.4, .08, .4, .025), chairFrame, { y: .83, z: .04 }))

// Asiento con caída frontal (cascada) y bordes que abrazan
chair.add(mesh(bend(rbox(.82, .1, .78, .045, 6), v => {
    v.y -= Math.max(-v.z - .18, 0) ** 2 * 1.1
    v.y += v.x * v.x * .25
}), mat('#26282d', { roughness: .9 }), { y: .91 }))

// Columna curva: sale de debajo del asiento y entra en la parte baja del respaldo
const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, .83, .1), new THREE.Vector3(0, .85, .38),
    new THREE.Vector3(0, .98, .48), new THREE.Vector3(0, 1.36, .45)
])
const spine = mesh(new THREE.TubeGeometry(spineCurve, 32, .035, 10), chairFrame)
spine.scale.x = 2.2
chair.add(spine)

// Respaldo de malla: más angosto abajo, curvo a los lados e inclinado hacia atrás
const backGeo = bend(rbox(.7, .86, .05, .025, 4), v => {
    v.x *= .82 + .18 * (v.y + .43) / .86
    v.z -= v.x * v.x * .6
})
const back = mesh(backGeo, mat('#ffffff', { map: meshTexture, roughness: .8 }), { y: 1.56, z: .45, rx: .12 })
chair.add(back)
// Placa de montaje atornillada al respaldo donde termina la columna
chair.add(mesh(rbox(.2, .26, .05, .02), chairFrame, { y: 1.3, z: .455, rx: .12 }))

// Brazos con altura ajustable: soporte desde el mecanismo, poste y descansabrazos
;[-1, 1].forEach(s => {
    chair.add(mesh(rbox(.26, .04, .07, .015, 2), chairFrame, { x: s * .27, y: .82, z: .1 }))
    chair.add(mesh(rbox(.06, .34, .08, .02), chairFrame, { x: s * .42, y: .98, z: .1 }))
    chair.add(mesh(rbox(.04, .14, .05, .012, 2), chairMetal, { x: s * .42, y: 1.18, z: .1 }))
    chair.add(mesh(rbox(.1, .04, .3, .018), chairFrame, { x: s * .42, y: 1.26, z: .05 }))
})

// Apoyada sobre la alfombra (su capa más alta termina en y = .1)
chair.position.set(.9, .1, 1.45)
chair.rotation.y = -.75
addPiece(chair)

/*==================== FLOATING SHELF & CORKBOARD ====================*/
const floating = []

const shelf = new THREE.Group()
shelf.add(mesh(rbox(1.5, .07, .4, .025), mat(COLORS.wood), {}))
;[[COLORS.orange, -.6, .42, .07], [COLORS.navy, -.52, .48, .08], ['#e85d4a', -.44, .38, .06], [COLORS.yellow, -.37, .45, .07]].forEach(([c, x, h, t]) => {
    const b = makeBook(h, t, .28, c)
    b.rotation.z = Math.PI / 2
    b.position.set(x, h / 2 + .035, 0)
    shelf.add(b)
})
const leaning = makeBook(.4, .06, .26, COLORS.green)
leaning.rotation.z = Math.PI / 2 - .32
leaning.position.set(-.24, .225, 0)
shelf.add(leaning)
const shelfPlant = makePlant(.7, 'trailing')
shelfPlant.position.set(.35, .035, 0)
shelf.add(shelfPlant)
shelf.position.set(-1.2, 3.35, -1.1)
addPiece(shelf)
floating.push(shelf)

const noteTexture = (text, bg) => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = 'rgba(0,0,0,.06)'
    ctx.fillRect(0, 0, 256, 40)
    ctx.fillStyle = 'rgba(0,0,0,.75)'
    ctx.font = 'bold 46px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 138)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
}

const board = new THREE.Group()
board.add(mesh(rbox(1.7, 1.1, .08, .04), mat(COLORS.woodDark), {}))
board.add(mesh(rbox(1.56, .96, .02, .01), mat(COLORS.cork, { roughness: 1 }), { z: .04, cast: false }))
;[['Laravel', '#ffd166', -.5, .18, .08], ['React', '#a0e7e5', .05, .22, -.1], ['AWS', '#ffadad', .52, .1, .12], ['Node.js', '#caffbf', -.22, -.22, -.06], ['Docker', '#bdb2ff', .35, -.22, .1]].forEach(([text, c, x, y, r]) => {
    // Nota con la esquina inferior levantada
    const geo = bend(new THREE.PlaneGeometry(.38, .38, 6, 6), v => { v.z += Math.max(-v.y - .05, 0) * Math.max(v.x + .05, 0) * .5 })
    board.add(mesh(geo, new THREE.MeshStandardMaterial({ map: noteTexture(text, c), roughness: .9, side: THREE.DoubleSide }), { x, y, z: .056, rz: r, cast: false }))
    board.add(mesh(new THREE.SphereGeometry(.028, 12, 10), mat('#e04848', { roughness: .3 }), { x, y: y + .15, z: .08, cast: false }))
    board.add(mesh(new THREE.CylinderGeometry(.008, .008, .03, 8), metal, { x, y: y + .15, z: .065, rx: Math.PI / 2, cast: false }))
})
board.position.set(1.0, 3.25, -1.15)
board.rotation.y = -.12
addPiece(board)
floating.push(board)

/*==================== CAMERA RIG ====================*/
// La cámara se mueve suavemente entre la vista general y el acercamiento a una pantalla
const heroEl = document.getElementById('home')
const rig = {
    basePos: new THREE.Vector3(),
    baseTarget: new THREE.Vector3(0, 1.55, 0),
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(0, 1.55, 0),
    focus: null,
    offset: 0,
    baseOffset: 0
}
let isMobile = false, viewW = 1, viewH = 1

const resize = () => {
    const w = canvas.clientWidth,
          h = canvas.clientHeight
    if (!w || !h) return
    viewW = w
    viewH = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    isMobile = w < 900
    // En móvil la planta de piso queda fuera del encuadre
    floorPlant.visible = !isMobile

    // En pantallas anchas desplazamos la escena a la derecha para dejar espacio al texto
    rig.baseOffset = isMobile ? 0 : -.2
    const dist = isMobile ? 10.2 : Math.max(10.5, 13.5 - camera.aspect * 1.4)
    rig.basePos.set(dist * .55, dist * .5, dist * .78)
    if (!rig.pos.lengthSq()) {
        rig.pos.copy(rig.basePos)
        rig.offset = rig.baseOffset
    }
    camera.updateProjectionMatrix()
}

new ResizeObserver(resize).observe(canvas)
resize()

const focusOn = obj => {
    world.updateMatrixWorld(true)
    const screen = obj.userData.screen
    const center = new THREE.Vector3()
    screen.getWorldPosition(center)
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(screen.getWorldQuaternion(new THREE.Quaternion()))
    const size = screen.geometry.parameters.width
    rig.focus = { pos: center.clone().add(normal.multiplyScalar(size * 2.1)), target: center }
    heroEl.classList.add('is-focused')
    setHover(null)
}

/*==================== THEME ====================*/
let lampOn = false
const applyTheme = theme => {
    const dark = theme === 'dark'
    hemi.intensity = dark ? .55 : 1.6
    hemi.color.set(dark ? '#8fd9cc' : '#f6fbf9')
    hemi.groundColor.set(dark ? '#0d2226' : '#cfe0da')
    sun.intensity = dark ? .7 : 2.2
    sun.color.set(dark ? '#9fd8e0' : '#fff4ea')
    lampOn = dark
    shadowCatcher.material.opacity = dark ? .3 : .12
}
applyTheme(document.documentElement.dataset.theme)
window.addEventListener('themechange', e => applyTheme(e.detail))

/*==================== STATUS ====================*/
const status = { fiskality: null, presto: null }

const paintLeds = () => {
    const values = Object.values(status)
    leds.forEach((led, i) => {
        const v = values[i % values.length]
        led.material.color.set(v === true ? '#4ade80' : v === false ? '#ff5f3a' : '#9ca3af')
    })
}

const applyStatus = detail => {
    Object.assign(status, detail)
    screens.fiskality.status = status.fiskality
    screens.presto.status = status.presto
    drawScreen(screens.fiskality)
    drawScreen(screens.presto)
    paintLeds()
}
window.addEventListener('status:update', e => applyStatus(e.detail))
// Si la verificación terminó antes de que cargara la escena
if (window.liveStatus) applyStatus(window.liveStatus)

window.addEventListener('langchange', () => Object.values(screens).forEach(drawScreen))

/*==================== INTERACTION ====================*/
const pointer = new THREE.Vector2(),
      smooth = new THREE.Vector2(),
      raycaster = new THREE.Raycaster(),
      labelEl = document.getElementById('scene-label')

let duckJump = 0, lampPulse = 0

const toast = msg => {
    const el = document.getElementById('toast')
    el.textContent = msg
    el.classList.add('is-visible')
    clearTimeout(toast.timer)
    toast.timer = setTimeout(() => el.classList.remove('is-visible'), 2400)
}

const openProject = key => {
    focusOn(key === 'fiskality' ? monitorLeft : key === 'presto' ? monitorRight : tablet)
    setTimeout(() => window.openProject && window.openProject(key), reduceMotion ? 0 : 750)
}

// Objetos interactivos: qué hacen y qué etiqueta muestran al pasar el cursor
const interactives = [
    { obj: monitorLeft, key: 'fiskality', label: () => t('desk.label.fiskality'), action: () => openProject('fiskality') },
    { obj: monitorRight, key: 'presto', label: () => t('desk.label.presto'), action: () => openProject('presto') },
    { obj: tablet, key: 'sgse', label: () => t('desk.label.sgse'), action: () => openProject('sgse') },
    {
        obj: server, key: 'server', label: () => t('desk.label.server'),
        action: () => {
            const up = Object.values(status).filter(v => v === true).length
            toast(`🖥️ ${up}/${Object.keys(status).length} ${t('desk.serverToast')}`)
        }
    },
    {
        obj: lamp, key: 'lamp', label: () => t('desk.label.lamp'),
        action: () => {
            lampOn = !lampOn
            lampPulse = 1
            toast(`💡 ${window.localTime ? window.localTime() : ''} ${t('desk.lampToast')}`)
        }
    },
    { obj: board, key: 'board', label: () => t('desk.label.board'), action: () => window.smoothScrollTo('#stack') },
    {
        obj: duck, key: 'duck', label: () => t('desk.label.duck'),
        action: () => { duckJump = 1; toast(t('desk.duckToast')) }
    }
]

let hovered = null

const pick = e => {
    const r = canvas.getBoundingClientRect()
    raycaster.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera)
    const hits = raycaster.intersectObjects(interactives.map(i => i.obj), true)
    if (!hits.length) return null
    let o = hits[0].object
    while (o && !interactives.find(i => i.obj === o)) o = o.parent
    return interactives.find(i => i.obj === o) || null
}

const setHover = item => {
    if (hovered === item) return
    if (hovered && screens[hovered.key]) { screens[hovered.key].hover = false; drawScreen(screens[hovered.key]) }
    hovered = item
    if (item && screens[item.key] && !screens[item.key].locked) { screens[item.key].hover = true; drawScreen(screens[item.key]) }
    canvas.style.cursor = item ? 'pointer' : ''
    labelEl.classList.toggle('is-visible', !!item)
    if (item) labelEl.textContent = item.label()
}

window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1
    pointer.y = (e.clientY / innerHeight) * 2 - 1
})

canvas.addEventListener('pointermove', e => {
    if (rig.focus) return
    setHover(pick(e))
    if (hovered) labelEl.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`
})
canvas.addEventListener('pointerleave', () => setHover(null))
canvas.addEventListener('click', e => {
    const item = pick(e)
    if (item) item.action()
})

// Al cerrar el caso de estudio, la cámara regresa a la vista general
window.addEventListener('project:close', () => {
    rig.focus = null
    heroEl.classList.remove('is-focused')
})

/*==================== X-RAY MODE ====================*/
// "Cómo está hecho": la escena pasa a malla de alambre y cada objeto muestra su tecnología
const xrayLayer = document.getElementById('xray-labels')
const wireMat = new THREE.MeshBasicMaterial({ color: '#2ec4b0', wireframe: true, transparent: true, opacity: .6, toneMapped: false })
const wireAccent = new THREE.MeshBasicMaterial({ color: '#ff6f4d', wireframe: true, toneMapped: false })
const screenPlanes = new Set([monitorLeft.userData.screen, monitorRight.userData.screen, tablet.userData.screen])
let xray = false

const xrayTargets = [
    { obj: monitorLeft, y: 2.75, key: 'xray.fiskality' },
    { obj: monitorRight, y: 2.75, key: 'xray.presto' },
    { obj: tablet, y: 2.2, key: 'xray.sgse' },
    { obj: server, y: 1.35, key: 'xray.server' },
    { obj: board, y: .75, key: 'xray.board' },
    { obj: chair, y: 1.95, key: 'xray.scene' }
]

const buildLabels = () => {
    // Datos reales del render: cuántos objetos y triángulos tiene la escena
    let meshes = 0
    world.traverse(o => { if (o.isMesh || o.isInstancedMesh) meshes++ })
    const tris = renderer.info.render.triangles.toLocaleString()
    xrayLayer.innerHTML = xrayTargets.map((x, i) => {
        const text = t(x.key).replace('{meshes}', meshes).replace('{tris}', tris)
        return `<div class="xray-tag" data-i="${i}">${text}</div>`
    }).join('')
}

const setXray = on => {
    xray = on
    world.traverse(o => {
        if (!o.isMesh || screenPlanes.has(o) || o === shadowCatcher) return
        const original = o.userData.material || o.material
        if (original.transparent) return
        o.userData.material = original
        o.material = on ? (original.color && original.color.getHexString() === 'ff5f3a' ? wireAccent : wireMat) : original
    })
    heroEl.classList.toggle('is-xray', on)
    document.documentElement.classList.toggle('xray-on', on)
    if (on) buildLabels()
    else xrayLayer.innerHTML = ''
    document.querySelectorAll('[data-desk="xray"]').forEach(b => b.setAttribute('aria-pressed', on))
}

const placeLabels = () => {
    const r = canvas.getBoundingClientRect(), box = xrayLayer.getBoundingClientRect(), v = new THREE.Vector3()
    xrayLayer.querySelectorAll('.xray-tag').forEach(el => {
        const x = xrayTargets[+el.dataset.i]
        x.obj.getWorldPosition(v)
        v.y += x.y
        v.project(camera)
        const px = r.left - box.left + (v.x * .5 + .5) * r.width, py = r.top - box.top + (-v.y * .5 + .5) * r.height
        el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`
    })
}

window.addEventListener('langchange', () => { if (xray) buildLabels() })

// API para los botones accesibles debajo de la escena (y para la terminal)
window.deskScene = {
    activate: key => {
        if (key === 'xray') return setXray(!xray)
        const item = interactives.find(i => i.key === key)
        if (item) item.action()
    },
    xray: on => setXray(on === undefined ? !xray : on)
}

/*==================== LOOP ====================*/
let visible = true,
    introStart = null

new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }).observe(canvas)

const elastic = x => x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1

const clock = new THREE.Clock()
const lampAnchor = new THREE.Vector3(.6, .72, 0)

const tick = () => {
    requestAnimationFrame(tick)
    if (!visible || document.hidden) return

    const time = clock.getElapsedTime(),
          now = performance.now()

    // Entrada de piezas
    if (introStart !== null && !reduceMotion) {
        pieces.forEach((p, i) => {
            const local = Math.min(Math.max((now - introStart - i * 70) / 900, 0), 1)
            const hover = hovered && hovered.obj === p ? 1.04 : 1
            p.scale.copy(p.userData.baseScale).multiplyScalar(Math.max(elastic(local), .0001) * (local === 1 ? hover : 1))
        })
    }

    // Cámara: vista general o acercamiento
    const goal = rig.focus || { pos: rig.basePos, target: rig.baseTarget }
    const ease = reduceMotion ? 1 : .07
    rig.pos.lerp(goal.pos, ease)
    rig.target.lerp(goal.target, ease)
    rig.offset += ((rig.focus ? 0 : rig.baseOffset) - rig.offset) * ease
    camera.position.copy(rig.pos)
    camera.lookAt(rig.target)
    if (Math.abs(rig.offset) > .001) camera.setViewOffset(viewW, viewH, viewW * rig.offset, 0, viewW, viewH)
    else camera.clearViewOffset()

    // Idle
    if (!reduceMotion) {
        floating.forEach((f, i) => { f.position.y += Math.sin(time * 1.2 + i * 1.5) * .0012 })
        deskPlant.rotation.z = Math.sin(time * 1.4) * .03
        steam.forEach(s => {
            const p = (time * .45 + s.userData.offset) % 1
            s.position.set(Math.sin(p * 6 + s.userData.offset * 8) * .03, TOP + .28 + p * .45, 0)
            s.scale.setScalar(.6 + p * 1.2)
            s.material.opacity = Math.sin(p * Math.PI) * .55
        })
        leds.forEach(l => { l.visible = Math.sin(time * 6 + l.userData.phase * 3) > -.6 })
        fans.forEach((f, i) => { f.rotation.z = time * (3 + i) })

        const parallax = rig.focus ? 0 : 1
        smooth.lerp(pointer, .05)
        world.rotation.y += (smooth.x * .12 * parallax - world.rotation.y) * .1
        world.rotation.x += (smooth.y * .03 * parallax - world.rotation.x) * .1
    }

    // Salto del pato
    if (duckJump > 0) {
        duckJump = Math.max(duckJump - .025, 0)
        const j = Math.sin((1 - duckJump) * Math.PI)
        duck.position.y = TOP + j * .45
        duck.rotation.y = -.5 + (1 - duckJump) * Math.PI * 2
    }

    // Lámpara
    lampPulse = Math.max(lampPulse - .03, 0)
    lampLight.intensity += ((lampOn ? 6 : 0) + lampPulse * 4 - lampLight.intensity) * .15
    bulbMat.color.set(lampOn ? '#ffd29a' : '#ffe2b8')
    lampLight.position.copy(lamp.localToWorld(lampAnchor.clone()))

    renderer.render(scene, camera)
    if (xray) placeLabels()
}

/*==================== START ====================*/
renderer.compile(scene, camera)
tick()
ready()

const startIntro = () => setTimeout(() => { introStart = performance.now() }, 350)
const loaderEl = document.getElementById('loader')
if (loaderEl.classList.contains('is-done')) startIntro()
else new MutationObserver((_, obs) => {
    if (loaderEl.classList.contains('is-done')) { obs.disconnect(); startIntro() }
}).observe(loaderEl, { attributes: true, attributeFilter: ['class'] })
