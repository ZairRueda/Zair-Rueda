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

/*==================== DESK ====================*/
const DESK_Y = 1.45
const desk = new THREE.Group()
desk.add(mesh(rbox(3.8, .14, 1.6, .06), mat(COLORS.cream), { y: DESK_Y }))
;[[-1.75, -.65], [1.75, -.65], [-1.75, .65], [1.75, .65]].forEach(([x, z]) => {
    desk.add(mesh(rbox(.12, DESK_Y - .08, .12, .04), mat(COLORS.wood), { x, y: (DESK_Y - .08) / 2 + .08, z }))
})
desk.add(mesh(rbox(3.4, .06, .08, .03), mat(COLORS.wood), { y: .55, z: -.65 }))
addPiece(desk)

const TOP = DESK_Y + .07

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
    g.add(mesh(rbox(.5, .04, .3, .02), mat(COLORS.dark), { y: TOP + .02 }))
    g.add(mesh(rbox(.08, .45, .08, .03), mat(COLORS.dark), { y: TOP + .25, z: -.04 }))
    g.add(mesh(rbox(1.5, .9, .07, .04), mat(COLORS.darker), { y: TOP + .78 }))
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .8), screenMat(screen.tex))
    plane.position.set(0, TOP + .78, .037)
    g.add(plane)
    g.position.set(x, 0, -.38)
    g.rotation.y = ry
    g.userData.screen = plane
    return g
}

const monitorLeft = addPiece(makeMonitor(screens.fiskality, -.82, .22))
const monitorRight = addPiece(makeMonitor(screens.presto, .82, -.22))

/*==================== TABLET (SGSE) ====================*/
const tablet = new THREE.Group()
tablet.add(mesh(rbox(.3, .03, .22, .02), mat(COLORS.dark), { y: TOP + .015, z: .02 }))
const tabletBody = new THREE.Group()
tabletBody.add(mesh(rbox(.62, .46, .03, .03), mat(COLORS.darker), {}))
const tabletScreen = new THREE.Mesh(new THREE.PlaneGeometry(.56, .4), screenMat(screens.sgse.tex))
tabletScreen.position.z = .017
tabletBody.add(tabletScreen)
tabletBody.position.set(0, TOP + .25, 0)
tabletBody.rotation.x = -.32
tablet.add(tabletBody)
tablet.position.set(-.98, 0, .3)
tablet.rotation.y = .35
tablet.userData.screen = tabletScreen
addPiece(tablet)

/*==================== KEYBOARD & MOUSE ====================*/
const keyboard = new THREE.Group()
keyboard.add(mesh(rbox(1.1, .05, .36, .025), mat('#e9e2d8'), { y: TOP + .025 }))
const keyGeo = rbox(.07, .03, .07, .012, 2)
const keys = new THREE.InstancedMesh(keyGeo, mat('#ffffff'), 13 * 4)
const dummy = new THREE.Object3D()
let k = 0
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 13; col++) {
        dummy.position.set(-.48 + col * .08, TOP + .06, -.12 + row * .08)
        dummy.updateMatrix()
        keys.setMatrixAt(k++, dummy.matrix)
    }
}
keys.castShadow = true
keyboard.add(keys)
keyboard.add(mesh(rbox(.36, .03, .07, .012, 2), mat(COLORS.orange), { y: TOP + .062, z: .2 }))
keyboard.position.set(.08, 0, .32)
addPiece(keyboard)

const mouse = mesh(new THREE.SphereGeometry(.1, 24, 16), mat('#ffffff'), { x: .86, y: TOP + .03, z: .36 })
mouse.scale.set(.75, .35, 1)
addPiece(mouse)

/*==================== MUG WITH STEAM ====================*/
const mug = new THREE.Group()
mug.add(mesh(new THREE.CylinderGeometry(.11, .1, .24, 24), mat(COLORS.orange), { y: TOP + .12 }))
mug.add(mesh(new THREE.TorusGeometry(.065, .02, 10, 20), mat(COLORS.orange), { x: .12, y: TOP + .13, rz: Math.PI / 2, ry: Math.PI / 2 }))
mug.add(mesh(new THREE.CylinderGeometry(.095, .095, .01, 24), mat('#6b3e1f'), { y: TOP + .225, cast: false }))
mug.position.set(1.45, 0, .25)
addPiece(mug)

const steam = Array.from({ length: 3 }, (_, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }))
    s.userData.offset = i / 3
    mug.add(s)
    return s
})

/*==================== PLANT ====================*/
const makePlant = (scale = 1) => {
    const g = new THREE.Group()
    g.add(mesh(new THREE.CylinderGeometry(.16, .12, .28, 20), mat(COLORS.terracotta), { y: .14 }))
    g.add(mesh(new THREE.CylinderGeometry(.17, .17, .05, 20), mat('#c86a40'), { y: .28 }))
    const leafGeo = new THREE.IcosahedronGeometry(.13, 0)
    ;[[0, .45, 0, 1.2], [.1, .38, .06, .9], [-.11, .4, -.04, .95], [.02, .58, -.03, .8], [-.05, .36, .1, .8]].forEach(([x, y, z, s], i) => {
        const leaf = mesh(leafGeo, mat(i % 2 ? COLORS.green : COLORS.greenDark, { flatShading: true }), { x, y, z, ry: i })
        leaf.scale.setScalar(s)
        g.add(leaf)
    })
    g.scale.setScalar(scale)
    return g
}

const deskPlant = makePlant(.95)
deskPlant.position.set(-1.55, TOP, -.45)
addPiece(deskPlant)

/*==================== BOOKS ====================*/
const books = new THREE.Group()
;[[COLORS.navy, 0], ['#e85d4a', .02], [COLORS.yellow, -.03]].forEach(([color, r], i) => {
    books.add(mesh(rbox(.42, .07, .3, .015), mat(color), { y: TOP + .035 + i * .072, ry: r + i * .08 }))
})
books.position.set(-1.55, 0, .38)
addPiece(books)

/*==================== RUBBER DUCK ====================*/
const duck = new THREE.Group()
const duckMat = mat('#ffd23f')
duck.add(mesh(new THREE.SphereGeometry(.11, 20, 16), duckMat, { y: .09 }))
duck.children[0].scale.set(1.15, .85, 1)
duck.add(mesh(new THREE.SphereGeometry(.075, 20, 16), duckMat, { y: .22, z: .02 }))
duck.add(mesh(new THREE.ConeGeometry(.035, .07, 12), mat(COLORS.orange), { y: .21, z: .1, rx: Math.PI / 2 }))
;[-.035, .035].forEach(x => duck.add(mesh(new THREE.SphereGeometry(.013, 8, 8), mat('#222'), { x, y: .245, z: .08 })))
duck.position.set(1.12, TOP, -.05)
duck.rotation.y = -.5
addPiece(duck)

/*==================== DESK LAMP ====================*/
const lamp = new THREE.Group()
lamp.add(mesh(new THREE.CylinderGeometry(.16, .18, .05, 24), mat(COLORS.navy), { y: .025 }))
lamp.add(mesh(new THREE.CylinderGeometry(.022, .022, .7, 10), mat(COLORS.navy), { y: .36, x: .08, rz: -.25 }))
lamp.add(mesh(new THREE.CylinderGeometry(.022, .022, .5, 10), mat(COLORS.navy), { y: .78, x: .3, rz: -1.1 }))
const lampHead = mesh(new THREE.ConeGeometry(.13, .22, 20, 1, true), mat(COLORS.navy, { side: THREE.DoubleSide }), { x: .55, y: .82, rz: -.5 })
lamp.add(lampHead)
const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffe2b8' })
const bulb = mesh(new THREE.SphereGeometry(.05, 12, 12), bulbMat, { x: .58, y: .77, cast: false })
lamp.add(bulb)
lamp.position.set(-1.65, TOP, -.25)
lamp.rotation.y = .5
addPiece(lamp)

/*==================== SERVER TOWER ====================*/
// Los LEDs reflejan el estado real de los proyectos en producción
const server = new THREE.Group()
server.add(mesh(rbox(.5, 1.0, .85, .05), mat(COLORS.dark), { y: .58 }))
const leds = []
for (let i = 0; i < 6; i++) {
    const led = mesh(rbox(.3, .035, .02, .01, 2), new THREE.MeshBasicMaterial({ color: '#9ca3af' }), { y: .35 + i * .1, z: .43, cast: false })
    led.userData.phase = Math.random() * 10
    leds.push(led)
    server.add(led)
}
server.position.set(1.25, .02, -.15)
addPiece(server)

/*==================== CHAIR ====================*/
const chair = new THREE.Group()
chair.add(mesh(rbox(.8, .12, .75, .06), mat(COLORS.orange), { y: .95 }))
chair.add(mesh(rbox(.8, .85, .12, .06), mat(COLORS.orange), { y: 1.45, z: .38, rx: -.1 }))
chair.add(mesh(new THREE.CylinderGeometry(.05, .05, .7, 12), mat('#9a9aa6'), { y: .55 }))
for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    chair.add(mesh(rbox(.42, .05, .07, .02), mat('#55555f'), { x: Math.cos(a) * .2, y: .18, z: Math.sin(a) * .2, ry: -a }))
    chair.add(mesh(new THREE.SphereGeometry(.05, 10, 10), mat('#2a2a30'), { x: Math.cos(a) * .4, y: .08, z: Math.sin(a) * .4 }))
}
chair.position.set(.9, 0, 1.45)
chair.rotation.y = -.75
addPiece(chair)

/*==================== FLOATING SHELF & CORKBOARD ====================*/
const floating = []

const shelf = new THREE.Group()
shelf.add(mesh(rbox(1.5, .08, .4, .03), mat(COLORS.wood), {}))
;[[COLORS.orange, -.55, .42], [COLORS.navy, -.42, .5], ['#e85d4a', -.29, .38], [COLORS.yellow, -.17, .46]].forEach(([c, x, h]) => {
    shelf.add(mesh(rbox(.11, h, .3, .02), mat(c), { x, y: h / 2 + .04 }))
})
const shelfPlant = makePlant(.7)
shelfPlant.position.set(.35, .04, 0)
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
    ctx.fillStyle = 'rgba(0,0,0,.75)'
    ctx.font = 'bold 46px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 132)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
}

const board = new THREE.Group()
board.add(mesh(rbox(1.7, 1.1, .08, .05), mat(COLORS.woodDark), {}))
board.add(mesh(rbox(1.55, .95, .02, .02), mat(COLORS.cork), { z: .04, cast: false }))
;[['Laravel', '#ffd166', -.5, .18, .08], ['React', '#a0e7e5', .05, .22, -.1], ['AWS', '#ffadad', .52, .1, .12], ['Node.js', '#caffbf', -.22, -.22, -.06], ['Docker', '#bdb2ff', .35, -.22, .1]].forEach(([text, c, x, y, r]) => {
    const note = mesh(new THREE.PlaneGeometry(.38, .38), new THREE.MeshStandardMaterial({ map: noteTexture(text, c), roughness: .9 }), { x, y, z: .055, rz: r, cast: false })
    board.add(note)
    board.add(mesh(new THREE.SphereGeometry(.03, 10, 10), mat('#e04848'), { x, y: y + .15, z: .07, cast: false }))
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
const lampAnchor = new THREE.Vector3(.58, .7, 0)

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
