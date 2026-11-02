/*==================== I18N (ES / EN) ====================*/
// El español vive en el HTML; aquí solo se guarda el inglés. Al iniciar se respaldan los textos
// originales para poder volver a español sin duplicarlos.
(function () {
    const html = {
        "nav.about": "About",
        "nav.experience": "Experience",
        "nav.projects": "Projects",
        "nav.contact": "Contact",
        "nav.cta": "Let's talk",
        "hero.hello": "Hi, I'm",
        "hero.desc": "I build production systems that <strong>save money</strong>, remove errors and scale: from legacy PHP systems to modern platforms with Laravel, React, Node.js and AWS.",
        "hero.cta": "See projects <i class='bx bx-right-arrow-alt'></i>",
        "hero.cv": "Download CV <i class='bx bx-download'></i>",
        "hero.location": "<i class='bx bx-map'></i> Acapulco, Mexico",
        "hero.available": "<span class=\"dot dot--live\"></span> Open to new projects",
        "desk.hint": "<i class='bx bx-pointer'></i> Click the desk: everything you see is live in production",
        "about.tag": "ABOUT ME",
        "about.title": "Code with business impact",
        "about.p1": "I'm a Senior Full Stack Developer with <strong>5+ years</strong> building software in real production environments. I specialize in scalable architectures, legacy system modernization and technical leadership of agile teams.",
        "about.p2": "I combine strategic vision with precise technical execution: every feature has to move a business metric, whether I am leading a team or solving the critical task myself.",
        "about.s1": "years in production",
        "about.s2": "fewer operational errors",
        "about.s3": "faster processing",
        "about.s4": "legacy systems modernized",
        "about.c3": "<i class='bx bx-group'></i> Scrum leadership",
        "about.c4": "<i class='bx bx-world'></i> English B2",
        "about.badge": "YEARS",
        "exp.tag": "CAREER",
        "exp.title": "Experience",
        "exp.n.role": "Senior Full Stack Developer",
        "exp.n.place": "Maritime logistics and freight · Acapulco, Mexico",
        "exp.n.date": "<span class=\"dot dot--live\"></span> May 2022 — Present",
        "exp.n.b1": "<strong>Technical leadership:</strong> led a team of 4 developers building an integrated logistics management system, cutting operational errors by <mark>35%</mark> through automation with Laravel and React.",
        "exp.n.b2": "<strong>Critical project rescue:</strong> spotted that an external vendor was misaligned with real operations; I took over the project, redesigned it from scratch and delivered it, avoiding the loss of <mark>thousands of pesos</mark> in fees and rework.",
        "exp.n.b3": "<strong>Strategic migration:</strong> modernized <mark>3 legacy systems</mark> (PHP 5.3 → PHP 8.3), improving security, performance and maintainability.",
        "exp.n.b4": "<strong>API integration:</strong> designed a REST API to sync data with external partners, speeding up processing by <mark>50%</mark>.",
        "exp.n.b5": "<strong>DevOps:</strong> built CI/CD pipelines with Docker and deployed services on AWS (EC2 + S3), shortening delivery times.",
        "exp.f.role": "Full Stack Web Developer",
        "exp.f.place": "Projects for clients and small businesses",
        "exp.f.date": "Jan 2021 — May 2022",
        "exp.f.b1": "<strong>MLimpac:</strong> landing page with an automated email system (Nodemailer).",
        "exp.f.b2": "<strong>Veterinary System:</strong> app to manage medical appointments with a visual schedule.",
        "exp.e.title": "Education",
        "exp.e.role": "Education and certifications",
        "exp.e.1": "<strong>Scalable Software Architecture</strong><p>Based on <em>Designing Data-Intensive Applications</em> (M. Kleppmann): distributed systems, consistency and fault tolerance.</p>",
        "exp.e.2": "<strong>Full Stack Web Development · Udemy</strong><p>PHP, JavaScript, SQL and modern frameworks.</p>",
        "exp.e.3": "<strong>High school, Physics & Mathematics</strong><p>CETMAR (Centro de Estudios Tecnológicos del Mar), Acapulco.</p>",
        "proj.tag": "LIVE IN PRODUCTION",
        "proj.title": "Projects",
        "proj.f.all": "All",
        "proj.f.saas": "Platforms",
        "proj.badge.fisk": "<span class=\"dot dot--live\"></span> In production · fiskality.com",
        "proj.fisk.sub": "Multi-tenant SaaS for CFDI 4.0 e-invoicing, electronic accounting and payroll for companies and accounting firms",
        "proj.fisk.year": "2025 — now",
        "proj.badge.presto": "<span class=\"dot dot--live\"></span> In production",
        "proj.presto.sub": "Fixed and express loans with daily late fees and PDF receipts",
        "proj.badge.sgse": "<span class=\"dot dot--live\"></span> In production · Private",
        "proj.sgse.sub": "Security guard management: shifts, QR patrol checkpoints and badge login",
        "proj.badge.vet": "<span class=\"dot dot--live\"></span> Live demo",
        "proj.vet.title": "Veterinary System",
        "proj.vet.sub": "Appointment scheduling and patient records",
        "proj.badge.crypto": "<span class=\"dot dot--live\"></span> Live demo",
        "proj.crypto.sub": "Real-time cryptocurrency quotes",
        "proj.more": "<i class='bx bxl-github'></i> More projects on GitHub <i class='bx bx-right-arrow-alt'></i>",
        "stack.tag": "TOOLBOX",
        "stack.title": "Tech stack",
        "stack.db": "Databases",
        "stack.tools": "Tools",
        "stack.langs": "Languages",
        "stack.es": "<span>Spanish</span><span class=\"langs__bar\"><i style=\"--w:100%\"></i></span><em>Native</em>",
        "stack.en": "<span>English</span><span class=\"langs__bar\"><i style=\"--w:72%\"></i></span><em>B2</em>",
        "stack.note": "Fluent technical reading, documentation and meetings in English.",
        "contact.tag": "NEW PROJECT?",
        "contact.title": "<span class=\"split\">Let's work</span>\n                        <span class=\"split\">together!</span>",
        "contact.text": "Need to modernize a system, launch a product or strengthen your team? Write to me and let's talk about how I can help.",
        "footer.made": "© <span id=\"year\">2026</span> Andrés Zair Jiménez Rueda · Built with HTML, CSS, JS and Three.js",
        "kinetic.row": "<span>In production</span><span>Online</span><span>In production</span><span>Online</span><span>In production</span><span>Online</span><span>In production</span><span>Online</span>",
        "footer.hint": "<kbd>/</kbd> opens the terminal",
        "desk.kind.monitor": "Monitor",
        "desk.kind.monitor2": "Monitor",
        "desk.kind.server": "Server",
        "desk.kind.lamp": "Lamp"
}

    const strings = {
        "es": {
                "desk.online": "En línea",
                "desk.offline": "Sin respuesta",
                "desk.checking": "Verificando…",
                "desk.open": "Abrir proyecto",
                "desk.private": "Producto privado",
                "desk.label.fiskality": "Monitor · Fiskality — abrir",
                "desk.label.presto": "Monitor · Presto+ — abrir",
                "desk.label.sgse": "Tablet · SGSE (privado)",
                "desk.label.server": "Servidor · estado de producción",
                "desk.label.lamp": "Lámpara · hora en Acapulco",
                "desk.label.board": "Corcho · mi stack",
                "desk.label.duck": "Pato de hule · debugging",
                "desk.serverToast": "proyectos en línea ahora mismo (verificado desde tu navegador)",
                "desk.lampToast": "en Acapulco, México",
                "desk.duckToast": "🦆 ¡Cuac! Rubber duck debugging activado",
                "desk.statusShort": "en línea",
                "status.live": "En línea ahora · verificado desde tu navegador",
                "status.down": "No respondió a la verificación en este momento",
                "toast.copied": "📋 Correo copiado",
                "lang.switch": "Switch to English",
                "theme.switch": "Cambiar tema"
        },
        "en": {
                "desk.online": "Online",
                "desk.offline": "No response",
                "desk.checking": "Checking…",
                "desk.open": "Open project",
                "desk.private": "Private product",
                "desk.label.fiskality": "Monitor · Fiskality — open",
                "desk.label.presto": "Monitor · Presto+ — open",
                "desk.label.sgse": "Tablet · SGSE (private)",
                "desk.label.server": "Server · production status",
                "desk.label.lamp": "Lamp · time in Acapulco",
                "desk.label.board": "Corkboard · my stack",
                "desk.label.duck": "Rubber duck · debugging",
                "desk.serverToast": "projects online right now (checked from your browser)",
                "desk.lampToast": "in Acapulco, Mexico",
                "desk.duckToast": "🦆 Quack! Rubber duck debugging enabled",
                "desk.statusShort": "online",
                "status.live": "Online now · checked from your browser",
                "status.down": "Did not respond to the check right now",
                "toast.copied": "📋 Email copied",
                "lang.switch": "Cambiar a español",
                "theme.switch": "Toggle theme"
        }
}

    const projects = {
        "fiskality": {
                "meta": [
                        "2025 — now",
                        "Multi-tenant SaaS",
                        "In production"
                ],
                "summary": "A platform where companies and accounting firms issue invoices, keep their electronic accounting and run payroll in one place.",
                "bullets": [
                        "<strong>CFDI 4.0 e-invoicing:</strong> income, credit notes and payment 2.0, global invoices, cancellation with reason, quotes, advance payments, customer portal and PDF with QR.",
                        "<strong>Electronic accounting:</strong> journal entries, guided closing, Anexo 24 XML validated against XSD, bulk SAT downloads with e.firma, bank reconciliation, DIOT and provisional tax payments.",
                        "<strong>Payroll:</strong> incidents, vacations, year-end bonus, severance, profit sharing, annual income tax, IMSS/SUA movements and bank dispersion.",
                        "<strong>Architecture:</strong> multi-tenant with PostgreSQL Row-Level Security, modular monolith with an async worker (BullMQ), RBAC and encryption at rest for tax certificates.",
                        "<strong>Operations:</strong> moved the infrastructure from Railway to my own VPS with Docker and Caddy, CI/CD, verified daily backups and zero-downtime deploys (95/95 probes returned 200)."
                ],
                "links": [
                        "Visit fiskality.com"
                ]
        },
        "presto": {
                "title": "Presto+ · Loan Management",
                "meta": [
                        "2025 — now",
                        "In production"
                ],
                "summary": "A system to manage fixed and express loans: it computes installments, interest and late fees daily, records payments and issues PDF receipts.",
                "bullets": [
                        "Fixed and express loans with amortization schedule, simulator and loan requests.",
                        "Late fees and loan states updated by a daily scheduled job.",
                        "Reports for capital, interest, clients and active or assigned loans, bank accounts, data import and audit log.",
                        "Support ticket center with technical request logs to diagnose errors.",
                        "Unit and integration tests with Jest against a real PostgreSQL, plus Cypress/Vitest on the frontend."
                ],
                "links": [
                        "Visit Presto+"
                ]
        },
        "sgse": {
                "title": "SGSE · Security Management System",
                "meta": [
                        "2026",
                        "In production"
                ],
                "summary": "A platform for private security companies: manage guards, shifts and patrols at every site.",
                "bullets": [
                        "Sign in with a password or with each guard's <strong>badge QR code</strong>.",
                        "Checkpoints scanned with the camera to log patrols.",
                        "Configurable shifts (12/14 h) with a Gantt-style workload calendar.",
                        "Atomic roles and permissions: super admin, admin, supervisor and guard.",
                        "Real time with Socket.io and automatic CI deployment."
                ],
                "note": "Private product: client-only access, no public demo."
        },
        "vet": {
                "title": "Veterinary Management System",
                "meta": [
                        "2022",
                        "Freelance",
                        "Live"
                ],
                "summary": "An app for veterinary clinics to register patients and manage appointments.",
                "bullets": [
                        "Create, edit and delete appointments with form validation.",
                        "Responsive interface built with React and Tailwind CSS.",
                        "Deployed on Vercel."
                ],
                "links": [
                        "View demo",
                        "Code"
                ]
        },
        "crypto": {
                "meta": [
                        "2022",
                        "Live"
                ],
                "summary": "A quote tool that compares your local currency against the main cryptocurrencies using a public API.",
                "bullets": [
                        "REST API consumption with up-to-date market data.",
                        "Custom selectors built with reusable React hooks.",
                        "Deployed on Vercel."
                ],
                "links": [
                        "View demo",
                        "Code"
                ]
        }
}

    const head = {
        "es": {
                "title": "Andrés Zair Jiménez Rueda · Full Stack Senior"
        },
        "en": {
                "title": "Andrés Zair Jiménez Rueda · Senior Full Stack Developer"
        }
}

    const nodes = [...document.querySelectorAll('[data-i18n]')]
    const original = new Map(nodes.map(el => [el, el.innerHTML]))

    const detect = () => {
        try {
            const saved = localStorage.getItem('lang')
            if (saved) return saved
        } catch (e) {}
        return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en'
    }

    const i18n = {
        lang: 'es',
        projects,
        t: key => (strings[i18n.lang] && strings[i18n.lang][key]) || strings.es[key] || key,
        set(lang, persist) {
            i18n.lang = lang
            document.documentElement.lang = lang
            document.title = head[lang].title
            nodes.forEach(el => {
                el.innerHTML = lang === 'en' && html[el.dataset.i18n] ? html[el.dataset.i18n] : original.get(el)
            })
            if (persist) {
                try { localStorage.setItem('lang', lang) } catch (e) {}
            }
            window.dispatchEvent(new CustomEvent('langchange', { detail: lang }))
        }
    }

    window.i18n = i18n
    const lang = detect()
    if (lang !== 'es') i18n.set(lang)
    else document.documentElement.lang = 'es'
})()
