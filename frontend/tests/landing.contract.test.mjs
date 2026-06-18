import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('expone /landing como ruta publica sin alterar el login raiz', () => {
  const app = read('../src/App.tsx')

  assert.match(app, /const Landing = lazy\(\(\) =>/)
  assert.match(app, /path="\/landing"/)
  assert.match(app, /<Landing \/>/)
  assert.match(app, /<Route path="\/" element=\{!user \? <Login/)
})

test('incluye todas las secciones del PRD y evita claims prohibidos', () => {
  const landing = read('../src/pages/Landing.tsx')
  const sectionIds = [
    'problema',
    'solucion',
    'funcionalidades',
    'roles',
    'geocerca',
    'correcciones',
    'seguridad',
    'faq',
    'cta',
  ]

  for (const id of sectionIds) {
    assert.match(landing, new RegExp(`id="${id}"`), `Falta la seccion ${id}`)
  }

  assert.doesNotMatch(landing, /a prueba de fraude|antifraude total|monitoreo 24\/?7/i)
})

test('mantiene los screenshots de landing dentro de public/landing', () => {
  const employee = new URL('../public/landing/landing_hero_employee_mobile.png', import.meta.url)
  const admin = new URL('../public/landing/landing_admin_dashboard.png', import.meta.url)

  assert.equal(existsSync(employee), true)
  assert.equal(existsSync(admin), true)
})
