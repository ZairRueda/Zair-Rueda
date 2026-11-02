/*==================== TERMINAL ====================*/
// Consola interactiva: el logo ">_" cobra sentido. Se abre con el botón de la barra o con la tecla "/".
(function () {
    const term = document.getElementById('terminal'),
          output = document.getElementById('term-output'),
          input = document.getElementById('term-input'),
          form = document.getElementById('term-form')

    const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    const en = () => window.i18n && i18n.lang === 'en'
    const L = (es, eng) => en() ? eng : es

    const projectKeys = ['fiskality', 'presto', 'sgse', 'vet', 'crypto']
    const statusText = key => {
        const v = window.liveStatus && window.liveStatus[key]
        if (v === true) return `<span class="t-ok">● ${L('en línea', 'online')}</span>`
        if (v === false) return `<span class="t-warn">● ${L('sin respuesta', 'no response')}</span>`
        if (key === 'sgse') return `<span class="t-dim">🔒 ${L('privado', 'private')}</span>`
        if (key === 'vet' || key === 'crypto') return `<span class="t-dim">demo</span>`
        return `<span class="t-dim">… ${L('verificando', 'checking')}</span>`
    }

    const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`

    // Cada comando acepta su nombre en español y en inglés
    const commands = {
        help: {
            alias: ['ayuda', '?'],
            run: () => [
                L('Comandos disponibles:', 'Available commands:'),
                ...[
                    ['about', L('quién soy', 'who I am')],
                    ['projects', L('proyectos en producción', 'projects in production')],
                    ['open <proyecto>', L('abre un caso de estudio', 'opens a case study')],
                    ['experience', L('trayectoria', 'career')],
                    ['stack', L('tecnologías', 'technologies')],
                    ['status', L('estado en vivo de los servidores', 'live server status')],
                    ['contact', L('cómo contactarme', 'how to reach me')],
                    ['cv', L('descarga mi CV', 'downloads my CV')],
                    ['xray', L('cómo está hecha la escena 3D', 'how the 3D scene is made')],
                    ['time', L('hora en Acapulco', 'time in Acapulco')],
                    ['theme', L('cambia claro / oscuro', 'toggles light / dark')],
                    ['lang es|en', L('cambia el idioma', 'switches language')],
                    ['clear', L('limpia la pantalla', 'clears the screen')],
                    ['exit', L('cierra la terminal', 'closes the terminal')]
                ].map(([c, d]) => `  <span class="t-cmd">${esc(c).padEnd(17, ' ').replace(/ /g, '&nbsp;')}</span>${d}`),
                `<span class="t-dim">${L('Tip: usa Tab para autocompletar y ↑ ↓ para el historial. Los comandos también funcionan en español (ayuda, proyectos, abrir…).', 'Tip: Tab autocompletes, ↑ ↓ browses history.')}</span>`
            ]
        },
        about: {
            alias: ['sobre', 'whoami', 'yo'],
            run: () => [
                '<span class="t-strong">Andrés Zair Jiménez Rueda</span> — Full Stack Senior',
                L('Más de 5 años construyendo sistemas en producción: Laravel, React, Node.js y AWS.',
                  '5+ years building production systems: Laravel, React, Node.js and AWS.'),
                L('Modernizo sistemas legacy, lidero equipos ágiles y despliego mis propios servidores.',
                  'I modernize legacy systems, lead agile teams and run my own servers.'),
                `📍 Acapulco, ${L('México', 'Mexico')}`
            ]
        },
        projects: {
            alias: ['proyectos', 'ls', 'dir'],
            run: () => [
                L('Proyectos (escribe <span class="t-cmd">open nombre</span>):', 'Projects (type <span class="t-cmd">open name</span>):'),
                ...projectKeys.map(k => {
                    const p = window.projects[k]
                    return `  <span class="t-cmd">${k.padEnd(10, ' ').replace(/ /g, '&nbsp;')}</span>${esc(p.title.split(' · ')[0])} &nbsp;${statusText(k)}`
                })
            ]
        },
        open: {
            alias: ['abrir', 'cat'],
            run: arg => {
                const key = projectKeys.find(k => arg && k.startsWith(arg.toLowerCase().replace('+', '')))
                if (!key) return [L(`Uso: open <${projectKeys.join('|')}>`, `Usage: open <${projectKeys.join('|')}>`)]
                setTimeout(() => {
                    term.close()
                    if (window.deskScene && ['fiskality', 'presto', 'sgse'].includes(key)) {
                        window.smoothScrollTo('#home')
                        setTimeout(() => window.deskScene.activate(key), 500)
                    } else window.openProject(key)
                }, 350)
                return [L(`Abriendo ${key}…`, `Opening ${key}…`)]
            }
        },
        experience: {
            alias: ['experiencia', 'exp'],
            run: () => [
                `<span class="t-strong">NAVIOMAR</span> · ${L('Full Stack Senior · may 2022 — hoy', 'Senior Full Stack · May 2022 — present')}`,
                L('  -35% errores operativos · +50% velocidad · 3 sistemas legacy → PHP 8.3', '  -35% operational errors · +50% speed · 3 legacy systems → PHP 8.3'),
                `<span class="t-strong">Freelance</span> · ${L('Full Stack · 2021 — 2022', 'Full Stack · 2021 — 2022')}`,
                `<span class="t-dim">${L('Detalle completo en la sección Experiencia.', 'Full details in the Experience section.')}</span>`
            ]
        },
        stack: {
            alias: ['tecnologias', 'tecnologías'],
            run: () => [
                `backend   PHP · Laravel · Node.js · NestJS · Fastify · Python · .NET`,
                `frontend  React · Next.js · TypeScript · Tailwind · shadcn/ui`,
                `data      PostgreSQL · MySQL · MongoDB · Prisma · Redis`,
                `devops    Docker · AWS · CI/CD · Nginx · Caddy · Linux`
            ].map(l => l.replace(/^(\w+)(\s+)/, (_, a, b) => `<span class="t-cmd">${a}</span>${'&nbsp;'.repeat(b.length)}`))
        },
        status: {
            alias: ['estado'],
            run: () => [
                L('Verificado desde tu navegador:', 'Checked from your browser:'),
                `  fiskality.com &nbsp;${statusText('fiskality')}`,
                `  presto+ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${statusText('presto')}`,
                `  sgse &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${statusText('sgse')}`
            ]
        },
        contact: {
            alias: ['contacto', 'email', 'correo'],
            run: () => [
                `✉  ${link('mailto:andres.z.jimenez15@gmail.com', 'andres.z.jimenez15@gmail.com')}`,
                `in ${link('https://www.linkedin.com/in/andres-zair-jimenez-rueda-029262174/', 'linkedin.com/in/andres-zair-jimenez-rueda')}`,
                `gh ${link('https://github.com/ZairRueda', 'github.com/ZairRueda')}`
            ]
        },
        cv: {
            alias: ['curriculum', 'resume'],
            run: () => {
                const a = document.createElement('a')
                a.href = 'assets/pdf/CV-Zair.pdf'
                a.download = 'CV-Andres-Zair.pdf'
                a.click()
                return [L('📄 Descargando CV-Andres-Zair.pdf…', '📄 Downloading CV-Andres-Zair.pdf…')]
            }
        },
        time: {
            alias: ['hora', 'date'],
            run: () => [`🕒 ${window.localTime()} ${L('en Acapulco, México', 'in Acapulco, Mexico')}`]
        },
        xray: {
            alias: ['rayosx', 'rayos'],
            run: () => {
                if (!window.deskScene) return [L('La escena 3D no está disponible en este navegador.', 'The 3D scene is not available in this browser.')]
                setTimeout(() => {
                    term.close()
                    window.smoothScrollTo('#home')
                    window.deskScene.xray()
                }, 300)
                return [L('Activando rayos X…', 'Toggling X-ray…')]
            }
        },
        theme: {
            alias: ['tema'],
            run: () => {
                document.getElementById('theme-button').click()
                return [L('Tema cambiado.', 'Theme switched.')]
            }
        },
        lang: {
            alias: ['idioma'],
            run: arg => {
                const next = arg === 'es' || arg === 'en' ? arg : (en() ? 'es' : 'en')
                i18n.set(next, true)
                return [next === 'en' ? 'Language: English' : 'Idioma: español']
            }
        },
        clear: {
            alias: ['limpiar', 'cls'],
            run: () => { output.innerHTML = ''; return [] }
        },
        exit: {
            alias: ['salir', 'quit', 'q'],
            run: () => { setTimeout(() => term.close(), 150); return [L('Hasta luego 👋', 'Bye 👋')] }
        },
        sudo: {
            alias: [],
            run: () => [L('Permiso denegado: no estás en el archivo sudoers. Pero sí puedes contratarme 😉 → <span class="t-cmd">contact</span>',
                          'Permission denied: you are not in the sudoers file. You can hire me though 😉 → <span class="t-cmd">contact</span>')]
        }
    }

    const names = Object.entries(commands).flatMap(([k, c]) => [k, ...c.alias])
    const resolve = name => Object.entries(commands).find(([k, c]) => k === name || c.alias.includes(name))

    const print = (lines, cls = '') => {
        lines.forEach(l => {
            const div = document.createElement('div')
            div.className = 't-line ' + cls
            div.innerHTML = l
            output.appendChild(div)
        })
        output.scrollTop = output.scrollHeight
    }

    const promptHTML = () => '<span class="t-prompt">zair@acapulco</span>:<span class="t-path">~</span>$'

    const history = []
    let histIndex = 0

    const run = raw => {
        const line = raw.trim()
        print([`${promptHTML()} ${esc(line)}`], 't-echo')
        if (!line) return
        history.push(line)
        histIndex = history.length
        const [name, ...rest] = line.split(/\s+/)
        const found = resolve(name.toLowerCase())
        if (!found) return print([L(`comando no encontrado: ${esc(name)}. Escribe <span class="t-cmd">help</span> o <span class="t-cmd">ayuda</span>.`,
                                     `command not found: ${esc(name)}. Type <span class="t-cmd">help</span>.`)], 't-err')
        print(found[1].run(rest.join(' ')))
    }

    const welcome = () => {
        output.innerHTML = ''
        print([
            '<span class="t-logo">&gt;_</span> zair_rueda terminal v1.0',
            L('Escribe <span class="t-cmd">help</span> para ver los comandos. Prueba <span class="t-cmd">projects</span> o <span class="t-cmd">status</span>.',
              'Type <span class="t-cmd">help</span> to see the commands. Try <span class="t-cmd">projects</span> or <span class="t-cmd">status</span>.')
        ])
    }

    const open = () => {
        if (term.open) return
        if (!output.children.length) welcome()
        term.showModal()
        setTimeout(() => input.focus(), 50)
    }

    form.addEventListener('submit', e => {
        e.preventDefault()
        run(input.value)
        input.value = ''
    })

    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && history.length) {
            e.preventDefault()
            histIndex = Math.max(histIndex - 1, 0)
            input.value = history[histIndex]
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            histIndex = Math.min(histIndex + 1, history.length)
            input.value = history[histIndex] || ''
        } else if (e.key === 'Tab') {
            e.preventDefault()
            const [cmd, arg] = input.value.split(/\s+/)
            if (arg !== undefined) {
                const match = projectKeys.find(k => k.startsWith(arg.toLowerCase()))
                if (match) input.value = `${cmd} ${match}`
            } else {
                const match = names.find(n => n.startsWith(cmd.toLowerCase()))
                if (match) input.value = match + ' '
            }
        }
    })

    term.addEventListener('click', e => { if (e.target === term) term.close() })
    document.getElementById('term-close').addEventListener('click', () => term.close())
    document.getElementById('terminal-button').addEventListener('click', open)

    // Tecla "/" abre la terminal (salvo que se esté escribiendo en un campo)
    document.addEventListener('keydown', e => {
        const typing = /input|textarea|select/i.test(document.activeElement.tagName)
        if ((e.key === '/' || e.key === '`') && !typing && !term.open) {
            e.preventDefault()
            open()
        }
    })

    window.addEventListener('langchange', () => { if (!term.open) output.innerHTML = '' })
})()
