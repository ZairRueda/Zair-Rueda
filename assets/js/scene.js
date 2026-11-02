/*==================== HERO 3D SCENE ====================*/
// Escritorio de desarrollador construido con geometría procedural (sin modelos externos).
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

const COLORS = {
    cream: '#fffaf2',
    wood: '#d9a066',
    woodDark: '#b97f47',
    dark: '#34343f',
    darker: '#25252d',
    orange: '#ff7a1a',
    yellow: '#f7c65c',
    rug1: '#f39a4a',
    rug2: '#f7c260',
    rug3: '#fbe39a',
    green: '#5fae5a',
    greenDark: '#3f8f45',
    terracotta: '#d9774b',
    navy: '#2f3d7a',
    cork: '#c99a68'
}

/*==================== LIGHTS ====================*/
const hemi = new THREE.HemisphereLight('#fff6ea', '#e8c9a5', 1.6)
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

/*==================== SCREENS (CANVAS TEXTURES) ====================*/
const makeScreen = (w, h) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return { c, ctx: c.getContext('2d'), tex }
}

const codeLines = [
    "Route::middleware('auth')->group(function () {",
    "    Route::get('/tickets', [TicketController::class, 'index']);",
    "    Route::post('/tickets', [TicketController::class, 'store']);",
    "});",
    "",
    "class TicketController extends Controller",
    "{",
    "    public function store(StoreTicketRequest $request)",
    "    {",
    "        $ticket = Ticket::create($request->validated());",
    "        broadcast(new TicketCreated($ticket));",
    "",
    "        return response()->json($ticket, 201);",
    "    }",
    "}"
]

const KEYWORDS = /^(class|extends|public|function|return|new|use|const|async|await)$/
const tokenColor = tok => {
    if (/^['"]/.test(tok)) return '#a5e075'
    if (/^\$/.test(tok)) return '#ffa95e'
    if (KEYWORDS.test(tok)) return '#c792ea'
    if (/^[A-Z]/.test(tok)) return '#ffd866'
    if (/^[(){}\[\];,>:=-]+$/.test(tok)) return '#89ddff'
    return '#e6e6f0'
}

const editor = makeScreen(768, 448)
let typed = 0
const totalChars = codeLines.reduce((n, l) => n + l.length + 1, 0)

const drawEditor = () => {
    const { ctx, c } = editor
    ctx.fillStyle = '#1e1f29'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = '#2a2b38'
    ctx.fillRect(0, 0, c.width, 34)
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(20 + i * 20, 17, 6, 0, Math.PI * 2)
        ctx.fill()
    })
    ctx.fillStyle = '#ff7a1a'
    ctx.fillRect(90, 0, 190, 34)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 15px monospace'
    ctx.fillText('TicketController.php', 102, 22)

    ctx.font = '17px monospace'
    let remaining = typed, y = 64
    for (let i = 0; i < codeLines.length; i++) {
        ctx.fillStyle = '#555872'
        ctx.fillText(String(i + 1).padStart(2, ' '), 12, y)
        const line = codeLines[i].slice(0, Math.max(0, remaining))
        let x = 52
        line.split(/(\s+|'[^']*'?|[(){}\[\];,]|->|::)/).filter(Boolean).forEach(tok => {
            ctx.fillStyle = tokenColor(tok)
            ctx.fillText(tok, x, y)
            x += ctx.measureText(tok).width
        })
        if (remaining >= 0 && remaining <= codeLines[i].length && Math.floor(performance.now() / 400) % 2) {
            ctx.fillStyle = '#ff7a1a'
            ctx.fillRect(x + 1, y - 15, 9, 19)
        }
        remaining -= codeLines[i].length + 1
        y += 25
    }
    editor.tex.needsUpdate = true
}

const terminal = makeScreen(768, 448)
const logLines = [
    ['$ ', 'docker compose up -d --build', '#e6e6f0'],
    ['✔ ', 'api      Started', '#7ee787'],
    ['✔ ', 'postgres Healthy', '#7ee787'],
    ['$ ', 'npm run test', '#e6e6f0'],
    ['PASS ', 'tickets.e2e-spec.ts (42 tests)', '#7ee787'],
    ['$ ', 'deploy --target aws-ec2', '#e6e6f0'],
    ['↑ ', 'Uploading build to S3...', '#ffd866'],
    ['✔ ', 'Deployed in 38s 🚀', '#7ee787']
]
let shownLogs = 0
const bars = Array.from({ length: 9 }, () => Math.random())

const drawTerminal = t => {
    const { ctx, c } = terminal
    ctx.fillStyle = '#16171f'
    ctx.fillRect(0, 0, c.width, c.height)

    // Mini dashboard
    ctx.fillStyle = '#20222d'
    ctx.fillRect(16, 16, c.width - 32, 170)
    ctx.fillStyle = '#8b8fa8'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText('Requests / min', 32, 42)
    ctx.fillStyle = '#7ee787'
    ctx.fillText('● 99.98% uptime', c.width - 175, 42)
    bars.forEach((b, i) => {
        const h = 30 + (Math.sin(t * 1.6 + i * .8) * .5 + .5) * 70 * (.5 + b * .5)
        const grad = ctx.createLinearGradient(0, 170 - h, 0, 170)
        grad.addColorStop(0, '#ff7a1a')
        grad.addColorStop(1, '#ffb547')
        ctx.fillStyle = grad
        ctx.fillRect(40 + i * 76, 170 - h, 46, h)
    })

    // Logs
    ctx.font = '17px monospace'
    logLines.slice(0, shownLogs).forEach(([prefix, text, color], i) => {
        const y = 222 + i * 26
        ctx.fillStyle = prefix.trim() === '$' ? '#ff7a1a' : color
        ctx.fillText(prefix, 20, y)
        ctx.fillStyle = color
        ctx.fillText(text, 20 + ctx.measureText(prefix).width, y)
    })
    terminal.tex.needsUpdate = true
}

const screenMat = tex => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })

const makeMonitor = (tex, x, ry) => {
    const g = new THREE.Group()
    g.add(mesh(rbox(.5, .04, .3, .02), mat(COLORS.dark), { y: TOP + .02 }))
    g.add(mesh(rbox(.08, .45, .08, .03), mat(COLORS.dark), { y: TOP + .25, z: -.04 }))
    g.add(mesh(rbox(1.5, .9, .07, .04), mat(COLORS.darker), { y: TOP + .78 }))
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .8), screenMat(tex))
    screen.position.set(0, TOP + .78, .037)
    g.add(screen)
    g.position.set(x, 0, -.38)
    g.rotation.y = ry
    return g
}

addPiece(makeMonitor(editor.tex, -.82, .22))
addPiece(makeMonitor(terminal.tex, .82, -.22))

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
keyboard.position.set(-.1, 0, .32)
addPiece(keyboard)

const mouse = mesh(new THREE.SphereGeometry(.1, 24, 16), mat('#ffffff'), { x: .75, y: TOP + .03, z: .36 })
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
    books.add(mesh(rbox(.5, .07, .34, .015), mat(color), { y: TOP + .035 + i * .072, ry: r + i * .08 }))
})
books.position.set(-1.45, 0, .3)
addPiece(books)

/*==================== RUBBER DUCK (interactive) ====================*/
const duck = new THREE.Group()
const duckMat = mat('#ffd23f')
duck.add(mesh(new THREE.SphereGeometry(.11, 20, 16), duckMat, { y: .09 }))
duck.children[0].scale.set(1.15, .85, 1)
duck.add(mesh(new THREE.SphereGeometry(.075, 20, 16), duckMat, { y: .22, z: .02 }))
duck.add(mesh(new THREE.ConeGeometry(.035, .07, 12), mat(COLORS.orange), { y: .21, z: .1, rx: Math.PI / 2 }))
;[-.035, .035].forEach(x => duck.add(mesh(new THREE.SphereGeometry(.013, 8, 8), mat('#222'), { x, y: .245, z: .08 })))
duck.position.set(1.1, TOP, -.05)
duck.rotation.y = -.5
addPiece(duck)

/*==================== DESK LAMP ====================*/
const lamp = new THREE.Group()
lamp.add(mesh(new THREE.CylinderGeometry(.16, .18, .05, 24), mat(COLORS.navy), { y: .025 }))
lamp.add(mesh(new THREE.CylinderGeometry(.022, .022, .7, 10), mat(COLORS.navy), { y: .36, x: .08, rz: -.25 }))
lamp.add(mesh(new THREE.CylinderGeometry(.022, .022, .5, 10), mat(COLORS.navy), { y: .78, x: .3, rz: -1.1 }))
const lampHead = mesh(new THREE.ConeGeometry(.13, .22, 20, 1, true), mat(COLORS.navy, { side: THREE.DoubleSide }), { x: .55, y: .82, rz: -.5 })
lamp.add(lampHead)
const bulb = mesh(new THREE.SphereGeometry(.05, 12, 12), new THREE.MeshBasicMaterial({ color: '#ffe2b8' }), { x: .58, y: .77, cast: false })
lamp.add(bulb)
lamp.position.set(-1.65, TOP, -.25)
lamp.rotation.y = .5
addPiece(lamp)

/*==================== SERVER TOWER ====================*/
const server = new THREE.Group()
server.add(mesh(rbox(.5, 1.0, .85, .05), mat(COLORS.dark), { y: .58 }))
const leds = []
for (let i = 0; i < 6; i++) {
    const led = mesh(rbox(.3, .035, .02, .01, 2), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? '#ff7a1a' : '#4ade80' }), { y: .35 + i * .1, z: .43, cast: false })
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
;[['Laravel', '#ffd166', -.5, .18, .08], ['React', '#a0e7e5', .05, .22, -.1], ['AWS', '#ffadad', .52, .1, .12], ['Node.js', '#caffbf', -.22, -.22, -.06], ['Docker', '#bdb2ff', .35, -.22, .1]].forEach(([t, c, x, y, r]) => {
    const note = mesh(new THREE.PlaneGeometry(.38, .38), new THREE.MeshStandardMaterial({ map: noteTexture(t, c), roughness: .9 }), { x, y, z: .055, rz: r, cast: false })
    board.add(note)
    board.add(mesh(new THREE.SphereGeometry(.03, 10, 10), mat('#e04848'), { x, y: y + .15, z: .07, cast: false }))
})
board.position.set(1.0, 3.25, -1.15)
board.rotation.y = -.12
addPiece(board)
floating.push(board)

/*==================== LAYOUT / RESIZE ====================*/
const target = new THREE.Vector3(0, 1.55, 0)
let isMobile = false

const resize = () => {
    const w = canvas.clientWidth,
          h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    isMobile = w < 900

    // En pantallas anchas desplazamos la escena a la derecha para dejar espacio al texto
    if (!isMobile) camera.setViewOffset(w, h, -w * .2, 0, w, h)
    else camera.clearViewOffset()

    const dist = isMobile ? 10.2 : Math.max(10.5, 13.5 - camera.aspect * 1.4)
    camera.position.set(dist * .55, dist * .5, dist * .78)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
}

new ResizeObserver(resize).observe(canvas)
resize()

/*==================== THEME ====================*/
const applyTheme = theme => {
    const dark = theme === 'dark'
    hemi.intensity = dark ? .55 : 1.6
    hemi.color.set(dark ? '#9fb4ff' : '#fff6ea')
    hemi.groundColor.set(dark ? '#20263d' : '#e8c9a5')
    sun.intensity = dark ? .7 : 2.2
    sun.color.set(dark ? '#a8b8ff' : '#fff1dd')
    lampLight.intensity = dark ? 6 : 0
    bulb.material.color.set(dark ? '#ffd29a' : '#ffe2b8')
    shadowCatcher.material.opacity = dark ? .3 : .12
}
applyTheme(document.documentElement.dataset.theme)
window.addEventListener('themechange', e => applyTheme(e.detail))

/*==================== INTERACTION ====================*/
const pointer = new THREE.Vector2(),
      smooth = new THREE.Vector2(),
      raycaster = new THREE.Raycaster()

let duckJump = 0

window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1
    pointer.y = (e.clientY / innerHeight) * 2 - 1
})

const hitDuck = e => {
    const r = canvas.getBoundingClientRect()
    raycaster.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera)
    return raycaster.intersectObject(duck, true).length > 0
}

canvas.addEventListener('pointermove', e => { canvas.style.cursor = hitDuck(e) ? 'pointer' : '' })
canvas.addEventListener('click', e => {
    if (!hitDuck(e)) return
    duckJump = 1
    const toast = document.getElementById('toast')
    toast.textContent = '🦆 ¡Cuac! Rubber duck debugging activado'
    toast.classList.add('is-visible')
    setTimeout(() => toast.classList.remove('is-visible'), 2000)
})

/*==================== LOOP ====================*/
let visible = true,
    introStart = null,
    lastType = 0,
    lastLog = 0,
    pauseUntil = 0

new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }).observe(canvas)

const elastic = t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1

const clock = new THREE.Clock()

const tick = () => {
    requestAnimationFrame(tick)
    if (!visible || document.hidden) return

    const t = clock.getElapsedTime(),
          now = performance.now()

    // Entrada de piezas
    if (introStart !== null && !reduceMotion) {
        pieces.forEach((p, i) => {
            const local = Math.min(Math.max((now - introStart - i * 70) / 900, 0), 1)
            p.scale.copy(p.userData.baseScale).multiplyScalar(Math.max(elastic(local), .0001))
        })
    }

    // Código tecleándose
    if (now > pauseUntil && now - lastType > 28) {
        typed += 1 + Math.round(Math.random())
        lastType = now
        if (typed > totalChars + 2) { pauseUntil = now + 2500; typed = 0 }
    }
    drawEditor()

    // Logs de terminal
    if (now - lastLog > 900) {
        shownLogs = shownLogs >= logLines.length + 2 ? 0 : shownLogs + 1
        lastLog = now
    }
    drawTerminal(reduceMotion ? 0 : t)

    // Idle
    if (!reduceMotion) {
        floating.forEach((f, i) => { f.position.y += Math.sin(t * 1.2 + i * 1.5) * .0012 })
        deskPlant.rotation.z = Math.sin(t * 1.4) * .03
        steam.forEach(s => {
            const p = (t * .45 + s.userData.offset) % 1
            s.position.set(Math.sin(p * 6 + s.userData.offset * 8) * .03, TOP + .28 + p * .45, 0)
            s.scale.setScalar(.6 + p * 1.2)
            s.material.opacity = Math.sin(p * Math.PI) * .55
        })
        leds.forEach(l => { l.visible = Math.sin(t * 6 + l.userData.phase * 3) > -.6 })

        smooth.lerp(pointer, .05)
        world.rotation.y = smooth.x * .12
        world.rotation.x = smooth.y * .03
    }

    // Salto del pato
    if (duckJump > 0) {
        duckJump = Math.max(duckJump - .025, 0)
        const j = Math.sin((1 - duckJump) * Math.PI)
        duck.position.y = TOP + j * .45
        duck.rotation.y = -.5 + (1 - duckJump) * Math.PI * 2
    }

    lampLight.position.copy(lamp.localToWorld(new THREE.Vector3(.58, .7, 0)))

    renderer.render(scene, camera)
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
