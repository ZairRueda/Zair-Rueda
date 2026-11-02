/*==================== HELPERS ====================*/
const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(pointer: fine)').matches

/*==================== PROJECT DATA ====================*/
const projects = {
    fiskality: {
        title: 'Fiskality',
        image: 'assets/img/fiskality.jpg',
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
        image: 'assets/img/presto.jpg',
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
        image: 'assets/img/sgse.jpg',
        meta: ['2026', 'En producción'],
        summary: 'Plataforma para empresas de seguridad privada: controla guardias, turnos y rondines en cada sede.',
        bullets: [
            'Acceso con contraseña o con el <strong>QR del carnet</strong> de cada guardia.',
            'Checkpoints escaneados con la cámara para registrar rondines.',
            'Turnos configurables (12/14 h) con calendario de carga tipo Gantt.',
            'Roles y permisos atómicos: super admin, admin, supervisor y guardia.',
            'Tiempo real con Socket.io y despliegue automático por CI a VPS.'
        ],
        stack: ['NestJS', 'Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Socket.io', 'JWT', 'Docker'],
        links: [
            { label: 'Visitar SGSE', href: 'https://sgse.54-39-110-141.sslip.io', icon: 'bx-link-external', primary: true }
        ]
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
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#0f1424' : '#f5ede3')
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
$$('.split').forEach(el => {
    const text = el.textContent.trim()
    el.setAttribute('aria-label', text)
    el.innerHTML = [...text].map((ch, i) =>
        `<span class="char" aria-hidden="true" style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('')
})

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
    const p = projects[key]
    if (!p) return

    const media = `<img src="${p.image}" alt="">`

    modalContent.innerHTML = `
        <div class="modal__media">${media}</div>
        <div class="modal__body">
            <div class="modal__meta">${p.meta.map(m => `<span>${m}</span>`).join('')}</div>
            <h3 id="modal-title">${p.title}</h3>
            <p>${p.summary}</p>
            <ul class="job__list">${p.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
            <ul class="chips">${p.stack.map(s => `<li>${s}</li>`).join('')}</ul>
            ${p.note ? `<p class="project__subtitle"><i class='bx bx-lock-alt'></i> ${p.note}</p>` : ''}
            ${p.links.length ? `<div class="modal__links">${p.links.map(l => `
                <a href="${l.href}" target="_blank" rel="noopener" class="button ${l.primary ? 'button--accent' : 'button--ghost'}">
                    <i class='bx ${l.icon}'></i> ${l.label}
                </a>`).join('')}</div>` : ''}
        </div>`

    modal.showModal()
    document.body.style.overflow = 'hidden'
}

const closeModal = () => modal.close()
modal.addEventListener('close', () => { document.body.style.overflow = '' })
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
        showToast('📋 Correo copiado')
    } catch (err) {
        showToast(email)
    }
})

/*==================== YEAR ====================*/
$('#year').textContent = new Date().getFullYear()
