import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const tokens = body => Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]))
const light = tokens(css.match(/:root\s*\{([^}]+)\}/)[1])
const dark = { ...light, ...tokens(css.match(/html\[data-theme="dark"\]\s*\{([^}]+)\}/)[1]) }
const luminance = hex => {
  const rgb = hex.slice(1).match(/../g).map(channel => {
    const value = Number.parseInt(channel, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
}
const contrast = (a, b) => {
  const pair = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (pair[0] + 0.05) / (pair[1] + 0.05)
}

for (const [name, theme] of Object.entries({ light, dark })) {
  test(`${name} theme preserves the three original logo colors`, () => {
    assert.equal(theme['--cp-brand-teal'], '#14b8a6')
    assert.equal(theme['--cp-brand-indigo'], '#4f46e5')
    assert.equal(theme['--cp-brand-speed'], '#fde047')
  })
  test(`${name} theme text, actions, selections, and charts meet contrast requirements`, () => {
    const pairs = [
      ...['--cp-bg', '--cp-bg-elevated', '--cp-surface', '--cp-surface-soft'].flatMap(bg =>
        ['--cp-text', '--cp-text-muted', '--cp-text-soft'].map(fg => [fg, bg, 4.5])),
      ['--cp-action-fg', '--cp-action', 4.5],
      ['--cp-action-fg', '--cp-action-hover', 4.5],
      ['--cp-accent-fg', '--cp-accent', 4.5],
      ['--cp-accent', '--cp-accent-soft', 4.5],
      ['--cp-lead', '--cp-lead-soft', 4.5],
      ['--cp-link', '--cp-surface', 4.5],
      ...['qualify', 'develop', 'propose', 'close'].map(stage => [`--cp-stage-${stage}`, '--cp-surface-soft', 3]),
      ...['1', '2', '3', '4', '5', '6', 'none'].map(series => [`--cp-series-${series}`, '--cp-surface', 3]),
      ...['meeting', 'task', 'close'].map(kind => [`--cp-${kind}`, '--cp-surface', 3]),
      ['--cp-hero-action-fg', '--cp-brand-speed', 4.5],
      ['--cp-hero-action-fg', '--cp-hero-action-hover', 4.5],
    ]
    for (const [fg, bg, minimum] of pairs) {
      const ratio = contrast(theme[fg], theme[bg])
      assert.ok(ratio >= minimum, `${name}: ${fg} on ${bg}: ${ratio.toFixed(2)} < ${minimum}`)
    }
    for (const stop of theme['--cp-hero-gradient'].match(/#[a-f\d]{6}/gi)) {
      for (const [fg, minimum] of [['--cp-hero-fg', 4.5], ['--cp-hero-soft', 4.5], ['--cp-hero-emphasis', 3]]) {
        const ratio = contrast(theme[fg], stop)
        assert.ok(ratio >= minimum, `${name}: ${fg} on hero ${stop}: ${ratio.toFixed(2)} < ${minimum}`)
      }
    }
  })
}
