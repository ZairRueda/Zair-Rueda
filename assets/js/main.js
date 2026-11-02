/*==================== HELPERS ====================*/
const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(pointer: fine)').matches

/*==================== PROJECT DATA ====================*/
const projects = {
    fiskality: {
        title: 'Fiskality',
        image: 'assets/img/fiskality.webp',
        meta: ['2025 — hoy', 'SaaS multiempresa', 'En producción'],
        summary: 'Plataforma para que empresas y despachos contables facturen, lleven su contabilidad electrónica y paguen su nómina desde un solo lugar.',
        bullets: [
            '<strong>Facturación CFDI 4.0:</strong> ingreso, egreso y pago 2.0, factura global, cancelación con motivo, cotizaciones, anticipos, portal de clientes y PDF con QR.',
            '<strong>Contabilidad electrónica:</strong> pólizas, cierre guiado, XML del Anexo 24 validado contra XSD, descarga masiva del SAT con e.firma, conciliación bancaria, DIOT y pagos provisionales.',
            '<strong>Nómina:</strong> incidencias, vacaciones, aguinaldo, finiquito, PTU, ISR anual, movimientos IMSS/SUA y dispersión bancaria.',
            '<strong>Arquitectura:</strong> multi-tenant con Row-Level Security de PostgreSQL, monolito modular con worker asíncrono (BullMQ), RBAC y cifrado en reposo de los CSD.',
            '<strong>Operación:</strong> migré la infraestructura de Railway a un VPS propio con Docker y Caddy, CI/CD, respaldos diarios verificados y despliegues sin caída (95/95 sondeos en 200).'
        ],
        stack: ['Fastify', 'Next.js', 'TypeScript', 'PostgreSQL + RLS', 'Prisma', 'BullMQ', 'Redis', 'Zod', 'shadcn/ui', 'Docker', 'Caddy', 'GitHub Actions'],
        links: [
            { label: 'Visitar fiskality.com', href: 'https://fiskality.com', icon: 'bx-link-external', primary: true }
        ]
    },
    presto: {
        title: 'Presto+ · Gestión de Préstamos',
        image: 'assets/img/presto.webp',
        meta: ['2025 — hoy', 'En producción'],
        summary: 'Sistema para administrar préstamos fijos y express: calcula cuotas, intereses y mora al día, registra pagos y entrega recibos en PDF.',
        bullets: [
            'Préstamos fijos y express con tabla de amortización, simulador y solicitudes.',
            'Mora y estados actualizados con una tarea programada diaria.',
            'Reportes de capital, intereses, clientes y préstamos activos o asignados, cuentas bancarias, importación de datos y bitácora de auditoría.',
            'Centro de tickets de soporte con registro técnico de peticiones para diagnosticar errores.',
            'Pruebas unitarias e integración con Jest contra PostgreSQL real, y Cypress/Vitest en el frontend.'
        ],
        stack: ['Next.js 15', 'React 18', 'TypeScript', 'Express', 'Prisma', 'PostgreSQL', 'Jest', 'Cypress', 'Docker'],
        links: [
            { label: 'Visitar Presto+', href: 'https://presta-mas.54-39-110-141.sslip.io', icon: 'bx-link-external', primary: true }
        ]
    },
    sgse: {
        title: 'SGSE · Sistema de Gestión de Seguridad',
        image: 'assets/img/sgse.webp',
        meta: ['2026', 'En producción'],
        summary: 'Plataforma para empresas de seguridad privada: controla guardias, turnos y rondines en cada sede.',
        bullets: [
            'Acceso con contraseña o con el <strong>QR del carnet</strong> de cada guardia.',
            'Checkpoints escaneados con la cámara para registrar rondines.',
            'Turnos configurables (12/14 h) con calendario de carga tipo Gantt.',
            'Roles y permisos atómicos: super admin, admin, supervisor y guardia.',
            'Tiempo real con Socket.io y despliegue automático por CI.'
        ],
        stack: ['NestJS', 'Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Socket.io', 'JWT', 'Docker'],
        links: [],
        note: 'Producto privado: acceso solo para clientes, sin demo pública.'
    },
    vet: {
        title: 'Sistema de Gestión Veterinario',
        image: 'assets/img/portfolio2.png',
        meta: ['2022', 'Freelance', 'En vivo'],
        summary: 'Aplicación para que clínicas veterinarias registren pacientes y administren sus citas.',
        bullets: [
            'Alta, edición y eliminación de citas con validación de formularios.',
            'Interfaz responsiva construida con React y Tailwind CSS.',
            'Desplegada en Vercel.'
        ],
        stack: ['React', 'Tailwind CSS', 'JavaScript', 'Vercel'],
        links: [
            { label: 'Ver demo', href: 'https://veterinary-record-patients.vercel.app/', icon: 'bx-link-external', primary: true },
            { label: 'Código', href: 'https://github.com/ZairRueda/veterinary-record-patients', icon: 'bxl-github' }
        ]
    },
    crypto: {
        title: 'Crypto Checker',
        image: 'assets/img/portfolio3.png',
        meta: ['2022', 'En vivo'],
        summary: 'Cotizador que compara tu moneda local contra las principales criptomonedas consumiendo una API pública.',
        bullets: [
            'Consumo de API REST con datos de mercado actualizados.',
            'Selectores personalizados con hooks reutilizables en React.',
            'Desplegada en Vercel.'
        ],
        stack: ['React', 'Hooks', 'API REST', 'Vercel'],
        links: [
            { label: 'Ver demo', href: 'https://crypto-checker-react.vercel.app/', icon: 'bx-link-external', primary: true },
            { label: 'Código', href: 'https://github.com/ZairRueda/Crypto-Checker-React', icon: 'bxl-github' }
        ]
    }
}

/*==================== PRELOADER ====================*/
const loader = $('#loader'),
      loaderCount = $('#loader-count'),
      loaderBar = $('#loader-bar')

document.body.classList.add('is-loading')

let progress = 0,
    pageReady = false,
    sceneReady = false,
    loaded = false

const finishLoading = () => {
    if (loaded) return
    loaded = true
    loader.classList.add('is-done')
    document.body.classList.remove('is-loading')
    $$('.hero .split').forEach((el, i) => setTimeout(() => el.classList.add('is-in'), 150 + i * 160))
    $$('.hero .reveal').forEach(el => el.classList.add('is-visible'))
}

const tickLoader = () => {
    const target = pageReady && sceneReady ? 100 : pageReady ? 90 : 70
    progress += Math.max(.8, (target - progress) * .1)
    progress = Math.min(progress, target)
    loaderCount.textContent = String(Math.round(progress)).padStart(3, '0')
    loaderBar.style.width = progress + '%'
    if (progress >= 100) return setTimeout(finishLoading, 250)
    setTimeout(tickLoader, 16)
}
tickLoader()

window.addEventListener('load', () => { pageReady = true })
window.addEventListener('scene:ready', () => { sceneReady = true })
// Si WebGL tarda o falla, no bloqueamos la página
setTimeout(() => { pageReady = true; sceneReady = true }, 4000)
setTimeout(finishLoading, 6000)

/*==================== THEME ====================*/
const themeButton = $('#theme-button')

const syncThemeIcon = () => {
    const dark = document.documentElement.dataset.theme === 'dark'
    themeButton.innerHTML = `<i class='bx ${dark ? 'bx-sun' : 'bx-moon'}'></i>`
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#081214' : '#f3f5f2')
}
syncThemeIcon()

themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch (e) {}
    syncThemeIcon()
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }))
})

/*==================== MOBILE MENU ====================*/
const navMenu = $('#nav-menu'),
      navToggle = $('#nav-toggle')

const setMenu = open => {
    navMenu.classList.toggle('is-open', open)
    navToggle.setAttribute('aria-expanded', open)
    navToggle.innerHTML = `<i class='bx ${open ? 'bx-x' : 'bx-menu'}'></i>`
    document.body.style.overflow = open ? 'hidden' : ''
}

navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('is-open')))
$$('.nav__link').forEach(link => link.addEventListener('click', () => setMenu(false)))

/*==================== NAV INDICATOR + SCROLL SPY ====================*/
const navLinks = $$('.nav__link'),
      navIndicator = $('#nav-indicator')

const moveIndicator = link => {
    if (!link) { navIndicator.style.opacity = 0; return }
    navIndicator.style.opacity = 1
    navIndicator.style.width = link.offsetWidth + 'px'
    navIndicator.style.transform = `translateX(${link.offsetLeft}px)`
}

const setActive = id => {
    let active = null
    navLinks.forEach(link => {
        const match = link.getAttribute('href') === '#' + id
        link.classList.toggle('is-active', match)
        if (match) active = link
    })
    moveIndicator(active)
}

const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id) })
}, { rootMargin: '-45% 0px -50% 0px' })
$$('main section[id]').forEach(section => spy.observe(section))
window.addEventListener('resize', () => moveIndicator($('.nav__link.is-active')))

/*==================== HEADER HIDE + SCROLL PROGRESS ====================*/
const header = $('#header'),
      scrollProgress = $('#scroll-progress'),
      timeline = $('#timeline'),
      timelineFill = $('#timeline-fill')

let lastY = 0

const onScroll = () => {
    const y = window.scrollY,
          max = document.documentElement.scrollHeight - innerHeight

    scrollProgress.style.transform = `scaleX(${max > 0 ? y / max : 0})`
    header.classList.toggle('is-hidden', y > lastY && y > 400 && !navMenu.classList.contains('is-open'))
    lastY = y

    const rect = timeline.getBoundingClientRect(),
          ratio = (innerHeight * .6 - rect.top) / rect.height
    timelineFill.style.transform = `scaleY(${Math.min(Math.max(ratio, 0), 1)})`
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

/*==================== SPLIT TEXT ====================*/
const splitText = () => $$('.split').forEach(el => {
    if (el.querySelector('.char')) return
    const text = el.textContent.trim()
    el.setAttribute('aria-label', text)
    el.innerHTML = [...text].map((ch, i) =>
        `<span class="char" aria-hidden="true" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('')
})
splitText()

/*==================== REVEAL ON SCROLL ====================*/
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        $$('.split', entry.target).forEach(el => el.classList.add('is-in'))
        revealObserver.unobserve(entry.target)
    })
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' })

// Escalonado para elementos hermanos
$$('.reveal').forEach(el => {
    if (el.closest('.hero')) return
    const siblings = $$(':scope > .reveal', el.parentElement)
    el.style.setProperty('--delay', `${Math.min(siblings.indexOf(el), 6) * 80}ms`)
    revealObserver.observe(el)
})
$$('.contact__card').forEach(el => revealObserver.observe(el))

/*==================== COUNTERS ====================*/
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target,
              end = +el.dataset.count,
              start = performance.now(),
              duration = reduceMotion ? 0 : 1600

        const step = now => {
            const t = duration ? Math.min((now - start) / duration, 1) : 1
            el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)))
            if (t < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        counterObserver.unobserve(el)
    })
}, { threshold: .6 })
$$('[data-count]').forEach(el => counterObserver.observe(el))

/*==================== PROJECT FILTERS ====================*/
const filters = $$('.filter'),
      projectCards = $$('.project')

filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter
    filters.forEach(b => {
        b.classList.toggle('is-active', b === button)
        b.setAttribute('aria-selected', b === button)
    })
    projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat.split(' ').includes(filter)
        card.classList.toggle('is-hidden', !show)
        if (show) {
            card.classList.remove('is-visible')
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-visible')))
        }
    })
}))

/*==================== TILT + GLARE ====================*/
if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(el => {
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect(),
                  x = (e.clientX - r.left) / r.width,
                  y = (e.clientY - r.top) / r.height
            el.style.transform = `perspective(900px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg)`
            el.style.setProperty('--gx', `${x * 100}%`)
            el.style.setProperty('--gy', `${y * 100}%`)
        })
        el.addEventListener('pointerleave', () => { el.style.transform = '' })
    })
}

/*==================== PORTRAIT DEPTH ====================*/
// Las capas del retrato están en distintos planos Z; girar el contenedor crea el efecto 3D
const portrait = $('#portrait'),
      aboutVisual = $('#about-visual')

if (!reduceMotion) {
    const tiltPortrait = (x, y) => {
        portrait.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`
    }

    if (finePointer) {
        aboutVisual.addEventListener('pointermove', e => {
            const r = aboutVisual.getBoundingClientRect()
            tiltPortrait((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5)
        })
        aboutVisual.addEventListener('pointerleave', () => tiltPortrait(0, 0))
    } else {
        // En táctil, el retrato gira suavemente con el scroll
        window.addEventListener('scroll', () => {
            const r = aboutVisual.getBoundingClientRect(),
                  p = (r.top + r.height / 2) / innerHeight - .5
            tiltPortrait(Math.sin(p * 3) * .35, p * .5)
        }, { passive: true })
    }
}

/*==================== MAGNETIC BUTTONS ====================*/
if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(el => {
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect(),
                  x = e.clientX - r.left - r.width / 2,
                  y = e.clientY - r.top - r.height / 2
            el.style.transform = `translate(${x * .25}px, ${y * .35}px)`
        })
        el.addEventListener('pointerleave', () => { el.style.transform = '' })
    })
}

/*==================== CUSTOM CURSOR ====================*/
if (finePointer && !reduceMotion) {
    const cursor = $('#cursor')
    let cx = 0, cy = 0, tx = 0, ty = 0

    window.addEventListener('pointermove', e => {
        tx = e.clientX
        ty = e.clientY
        cursor.classList.add('is-visible')
    })
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'))

    const hoverables = 'a, button, .project, .chips li, .stat'
    document.addEventListener('pointerover', e => cursor.classList.toggle('is-hover', !!e.target.closest(hoverables)))

    const loop = () => {
        cx += (tx - cx) * .2
        cy += (ty - cy) * .2
        cursor.style.transform = `translate(${cx}px, ${cy}px)`
        requestAnimationFrame(loop)
    }
    loop()
}

/*==================== PROJECT MODAL ====================*/
const modal = $('#project-modal'),
      modalContent = $('#modal-content')

const openProject = key => {
    const base = projects[key]
    if (!base) return

    // En inglés se superponen los textos traducidos sobre los datos en español
    const en = i18n.lang === 'en' ? i18n.projects[key] || {} : {}
    const p = { ...base, ...en, links: base.links.map((l, i) => ({ ...l, label: (en.links && en.links[i]) || l.label })) }

    const live = liveStatus[key]
    const statusLine = live === undefined || live === null ? '' : `
        <p class="modal__status ${live ? 'is-up' : 'is-down'}"><span class="dot ${live ? 'dot--live' : ''}"></span> ${i18n.t(live ? 'status.live' : 'status.down')}</p>`

    modalContent.innerHTML = `
        <div class="modal__media"><img src="${p.image}" alt=""></div>
        <div class="modal__body">
            <div class="modal__meta">${p.meta.map(m => `<span>${m}</span>`).join('')}</div>
            <h3 id="modal-title">${p.title}</h3>
            ${statusLine}
            <p>${p.summary}</p>
            <ul class="job__list">${p.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
            <ul class="chips">${p.stack.map(s => `<li>${s}</li>`).join('')}</ul>
            ${p.note ? `<p class="project__subtitle"><i class='bx bx-lock-alt'></i> ${p.note}</p>` : ''}
            ${p.links.length ? `<div class="modal__links">${p.links.map(l => `
                <a href="${l.href}" target="_blank" rel="noopener" class="button ${l.primary ? 'button--accent' : 'button--ghost'}">
                    <i class='bx ${l.icon}'></i> ${l.label}
                </a>`).join('')}</div>` : ''}
        </div>`

    if (!modal.open) modal.showModal()
    document.body.style.overflow = 'hidden'
}
window.openProject = openProject

const closeModal = () => modal.close()
modal.addEventListener('close', () => {
    document.body.style.overflow = ''
    window.dispatchEvent(new Event('project:close'))
})
$('#modal-close').addEventListener('click', closeModal)
modal.addEventListener('click', e => { if (e.target === modal) closeModal() })

projectCards.forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.project))
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card.dataset.project) }
    })
})

/*==================== COPY EMAIL ====================*/
const toast = $('#toast')
let toastTimer

const showToast = msg => {
    toast.textContent = msg
    toast.classList.add('is-visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200)
}

$('#copy-email').addEventListener('click', async e => {
    const email = e.currentTarget.dataset.email
    try {
        await navigator.clipboard.writeText(email)
        showToast(i18n.t('toast.copied'))
    } catch (err) {
        showToast(email)
    }
})

/*==================== LIVE STATUS ====================*/
// Comprueba desde el navegador del visitante que los proyectos públicos respondan.
// Con mode: 'no-cors' la respuesta es opaca: si llega, el servidor está arriba.
const statusTargets = {
    fiskality: 'https://api.fiskality.com/health',
    presto: 'https://presta-mas.54-39-110-141.sslip.io/'
}
const liveStatus = { fiskality: null, presto: null }
window.liveStatus = liveStatus

const ping = url => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    return fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
        .then(() => true, () => false)
        .finally(() => clearTimeout(timer))
}

const renderDeskStatus = () => {
    const values = Object.values(liveStatus),
          up = values.filter(v => v === true).length,
          done = values.every(v => v !== null)
    $('#desk-status-text').textContent = done ? `${up}/${values.length} ${i18n.t('desk.statusShort')}` : i18n.t('desk.checking')
    $('#desk-status .dot').classList.toggle('dot--live', done && up === values.length)
}

Promise.all(Object.entries(statusTargets).map(([key, url]) => ping(url).then(ok => { liveStatus[key] = ok })))
    .then(() => {
        renderDeskStatus()
        window.dispatchEvent(new CustomEvent('status:update', { detail: { ...liveStatus } }))
    })
renderDeskStatus()

/*==================== LOCAL TIME ====================*/
window.localTime = () => new Intl.DateTimeFormat(i18n.lang === 'en' ? 'en-US' : 'es-MX', {
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Mexico_City'
}).format(new Date())

const renderTime = () => { $('#desk-time').textContent = window.localTime() }
renderTime()
setInterval(renderTime, 30000)

/*==================== DESK BUTTONS ====================*/
// Alternativa accesible (y para móvil) a hacer clic en los objetos 3D
$$('.desk-btn').forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.desk
    if (window.deskScene) return window.deskScene.activate(key)
    if (projects[key]) return openProject(key)
    if (key === 'lamp') return showToast(`💡 ${window.localTime()} ${i18n.t('desk.lampToast')}`)
    if (key === 'server') return showToast($('#desk-status-text').textContent)
}))

/*==================== LANGUAGE ====================*/
const langButton = $('#lang-button')

const syncLang = () => {
    const en = i18n.lang === 'en'
    langButton.textContent = en ? 'ES' : 'EN'
    langButton.setAttribute('aria-label', i18n.t('lang.switch'))
    themeButton.setAttribute('aria-label', i18n.t('theme.switch'))
    $('#year').textContent = new Date().getFullYear()
}

langButton.addEventListener('click', () => i18n.set(i18n.lang === 'en' ? 'es' : 'en', true))

window.addEventListener('langchange', () => {
    syncLang()
    splitText()
    $$('.split').forEach(el => { if (el.closest('.is-visible, .hero')) el.classList.add('is-in') })
    renderDeskStatus()
    renderTime()
    moveIndicator($('.nav__link.is-active'))
})
syncLang()
