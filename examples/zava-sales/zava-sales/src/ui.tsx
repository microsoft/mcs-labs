import { useEffect, useId, useRef } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { hashString, initials, logoMotif } from './domain'
import type { LogoMotif } from './domain'

const paths = {
  today: 'M3 11 12 3l9 8M5 10v11h5v-6h4v6h5V10',
  pipeline: 'M4 20V10m8 10V4m8 16v-7',
  leads: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-7a4 4 0 0 1 0 7.75',
  accounts: 'M4 21V5l8-3v19M12 8h8v13M2 21h20M7 7h2M7 11h2M7 15h2M15 12h2M15 16h2',
  activity: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m3 11h2m4 0h2m-8 4h2',
  search: 'm21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  lock: 'M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5zM12 14v3',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20.9 13A9 9 0 0 1 11 3a9 9 0 1 0 9.9 10',
  refresh: 'M20 7v5h-5M4 17v-5h5m-4-5a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-7z',
  task: 'M9 5h11M9 12h11M9 19h11M3 5l1 1 2-3M3 12l1 1 2-3M3 19l1 1 2-3',
  note: 'M14 2H4v20h16V8zM14 2v6h6M8 12h8M8 16h5',
  edit: 'm16 3 5 5-12 12-6 1 1-6zM14 5l5 5',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  mail: 'M3 5h18v14H3zM3 5l9 8 9-8',
  external: 'M14 3h7v7M10 14 21 3M10 3H3v18h18v-7',
  info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  menu: 'M4 6h16M4 12h16M4 18h16',
  flag: 'M5 21V4m0 0h12l-2.5 4.5L17 13H5',
  sparkle: 'M10 3.5 11.8 8.2 16.5 10 11.8 11.8 10 16.5 8.2 11.8 3.5 10 8.2 8.2zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9zM18 2.5l.6 1.4 1.4.6-1.4.6L18 6.5l-.6-1.4L16 4.5l1.4-.6z',
} as const
export type IconName = keyof typeof paths
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
export function Mark() {
  const gradient = useId()
  return <svg className="brand-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--cp-brand-teal)" /><stop offset="1" stopColor="var(--cp-brand-indigo)" /></linearGradient></defs><rect width="64" height="64" rx="14" fill={`url(#${gradient})`} /><g fill="var(--cp-brand-speed)"><rect x="8" y="19" width="10" height="3" rx="1.5" /><rect x="11" y="30.5" width="14" height="3" rx="1.5" /><rect x="8" y="42" width="10" height="3" rx="1.5" /></g><path d="M21 17H49V24L32 41H49V48H21V41L38 24H21Z" fill="var(--cp-brand-white)" /></svg>
}
const logoColors = ['#1E3A8A', '#BE123C', '#15803D', '#C2410C', '#0F766E', '#7E22CE', '#334155', '#0369A1', '#A16207', '#BE185D']
const motifs: Record<Exclude<LogoMotif, 'monogram'>, ReactNode> = {
  mountain: <><path d="M6 30 16 14l6 9 4-5 8 12Z" fill="currentColor" /><circle cx="28" cy="11" r="3" fill="currentColor" opacity=".7" /></>,
  wave: <path d="M7 16c3-3 6-3 9 0s6 3 9 0 6-3 8-1M7 24c3-3 6-3 9 0s6 3 9 0 6-3 8-1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />,
  tree: <><path d="M20 7 12 19h5l-7 10h20l-7-10h5Z" fill="currentColor" /><rect x="18.5" y="29" width="3" height="5" rx="1" fill="currentColor" /></>,
  star: <path d="M20 8.5 22.7 16.3 31 16.5 24.4 21.5 26.8 29.5 20 24.8 13.2 29.5 15.6 21.5 9 16.5 17.3 16.3Z" fill="currentColor" />,
  sun: <><path d="M12 27a8 8 0 0 1 16 0Z" fill="currentColor" /><path d="M7 31h26M20 12v4M11 17l2.5 2.5M29 17l-2.5 2.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></>,
  arrow: <path d="M11 12l8 8-8 8M20 12l8 8-8 8" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  shield: <><path d="M20 7l11 4v8c0 7.5-5 12-11 14-6-2-11-6.5-11-14v-8Z" fill="currentColor" /><path className="logo-cut" d="M14.5 19.5 20 24l5.5-4.5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  hex: <><path d="M20 8.5 30 14.2v11.6L20 31.5 10 25.8V14.2Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none" /><circle cx="20" cy="20" r="3.4" fill="currentColor" /></>,
}
export function CompanyLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = logoColors[hashString(name) % logoColors.length]
  const motif = logoMotif(name)
  return <svg className={`logo ${size}`} viewBox="0 0 40 40" aria-hidden="true" style={{ '--logo': color } as CSSProperties}>
    <rect className="logo-tile" width="40" height="40" rx="10" />
    {motif === 'monogram' ? <text x="20" y="27" textAnchor="middle" fontSize="19" fontWeight="700" fill="currentColor">{initials(name).slice(0, 1)}</text> : motifs[motif]}
  </svg>
}
type HairStyle = 'short' | 'side' | 'curly' | 'bun' | 'long' | 'buzz'
interface Face { skin: string; hair: string; style: HairStyle; shirt: string; bg: string; glasses: boolean }
const skins = ['#F9D7C0', '#F1C3A1', '#D9A37E', '#B97A55', '#8D5A3B', '#5E3B28']
const hairs = ['#2B1D16', '#4A2F23', '#7A4A2A', '#B7793F', '#D6B370', '#8B8F99']
const styles: HairStyle[] = ['short', 'side', 'curly', 'bun', 'long', 'buzz']
const shirts = ['#4F46E5', '#0D9488', '#DB2777', '#EA580C', '#334155', '#2563EB', '#7C3AED', '#059669']
const backdrops = ['#DBEAFE', '#FCE7F3', '#DCFCE7', '#FEF3C7', '#EDE9FE', '#CCFBF1', '#FFE4E6', '#E0F2FE']
const presets: Record<string, Partial<Face>> = {
  'Maya Chen': { style: 'bun', hair: hairs[0], skin: skins[1], shirt: shirts[0], bg: backdrops[4], glasses: false },
  'Ethan Brooks': { style: 'short', hair: hairs[1], skin: skins[0], shirt: shirts[5], bg: backdrops[0], glasses: false },
  'Daniel Okafor': { style: 'buzz', hair: hairs[0], skin: skins[5], shirt: shirts[1], bg: backdrops[5], glasses: false },
  'Sofia Marino': { style: 'long', hair: hairs[2], skin: skins[1], shirt: shirts[2], bg: backdrops[1], glasses: false },
  'Lukas Weber': { style: 'side', hair: hairs[4], skin: skins[0], shirt: shirts[4], bg: backdrops[3], glasses: true },
  'Priya Nair': { style: 'long', hair: hairs[0], skin: skins[3], shirt: shirts[6], bg: backdrops[2], glasses: false },
}
function face(name: string): Face {
  const h = hashString(name.trim().toLowerCase())
  const pick = <T,>(list: T[], shift: number) => list[(h >>> shift) % list.length]
  return { skin: pick(skins, 0), hair: pick(hairs, 4), style: pick(styles, 8), shirt: pick(shirts, 12), bg: pick(backdrops, 16), glasses: (h >>> 20) % 4 === 0, ...presets[name.trim()] }
}
const hairFront: Record<HairStyle, string> = {
  short: 'M20.5 27c-.6-9 4.6-14.5 11.5-14.5S44.1 18 43.5 27c-2-4.5-5.5-7-11.5-7S22.5 22.5 20.5 27Z',
  side: 'M20.4 28c-1.2-10 5-15.5 12-15.5 6.5 0 11.6 4.5 11.2 13.5-4.6-1-9.4-3.8-12.4-8.2-1.6 4.4-5.8 8-10.8 10.2Z',
  curly: 'M21 27c-3-2-3-7 0-9-1-4 3-7 6-6 2-3 8-3 10 0 3-1 7 2 6 6 3 2 3 7 0 9-1-5-4-8-11-8s-10 3-11 8Z',
  bun: 'M20.5 27.5c-.5-9.5 5-15 11.5-15S44 18 43.5 27.5c-1.5-5.5-5-8.5-11.5-8.5S22 22 20.5 27.5Z',
  long: 'M20 31c-1.2-11.5 4.5-18.5 12-18.5S45.2 19.5 44 31c-3-6.5-6.5-9.5-12-10-4.5 3.5-8 5.5-12 10Z',
  buzz: 'M21.2 25c.9-7.5 5.4-11.6 10.8-11.6s9.9 4.1 10.8 11.6c-3-3.2-6.4-4.6-10.8-4.6s-7.8 1.4-10.8 4.6Z',
}
export function Portrait({ name, size = 'md' }: { name: string; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const clip = useId()
  const f = face(name || 'Zava')
  return <svg className={`portrait ${size}`} viewBox="0 0 64 64" aria-hidden="true">
    <defs><clipPath id={clip}><circle cx="32" cy="32" r="32" /></clipPath></defs>
    <g clipPath={`url(#${clip})`}>
      <rect width="64" height="64" fill={f.bg} />
      {f.style === 'long' && <path d="M19 30c0-10.5 6-17.5 13-17.5S45 19.5 45 30v22H19Z" fill={f.hair} />}
      {f.style === 'bun' && <circle cx="32" cy="11.5" r="6.5" fill={f.hair} />}
      <path d="M9 66c0-13 10-20.5 23-20.5S55 53 55 66Z" fill={f.shirt} />
      <path d="M27 37h10v10c0 2.6-2.2 4.2-5 4.2s-5-1.6-5-4.2Z" fill={f.skin} />
      <path d="M27 41c3 2 7 2 10 0v-4H27Z" fill="#000" opacity=".1" />
      <path d="M26 46.5 32 53l6-6.5" stroke="#fff" strokeOpacity=".4" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <circle cx="20.6" cy="30" r="2.7" fill={f.skin} /><circle cx="43.4" cy="30" r="2.7" fill={f.skin} />
      <ellipse cx="32" cy="28.5" rx="11.5" ry="13" fill={f.skin} />
      <path d={hairFront[f.style]} fill={f.hair} />
      <path d="M25.2 25.3h4.4M34.4 25.3h4.4" stroke={f.hair} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="27.4" cy="29.2" r="1.35" fill="#1F2937" /><circle cx="36.6" cy="29.2" r="1.35" fill="#1F2937" />
      <circle cx="24.6" cy="33.4" r="2.1" fill="#F43F5E" opacity=".13" /><circle cx="39.4" cy="33.4" r="2.1" fill="#F43F5E" opacity=".13" />
      <path d="M28.6 34.6c2 1.9 4.8 1.9 6.8 0" stroke="#7C2D12" strokeOpacity=".65" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {f.glasses && <g fill="none" stroke="#1F2937" strokeWidth="1.3"><circle cx="27.4" cy="29.2" r="3.7" /><circle cx="36.6" cy="29.2" r="3.7" /><path d="M31.1 29h1.8" /></g>}
    </g>
  </svg>
}
export function Score({ score }: { score: number | null }) {
  return <span className="score" style={{ '--score': `${Math.min(100, Math.max(0, score ?? 0)) * 3.6}deg` } as CSSProperties} aria-label={score === null ? 'No lead score' : `Lead score ${score} out of 100`}><span>{score ?? '—'}</span></span>
}
export function Pill({ children, tone = '' }: { children: ReactNode; tone?: 'accent' | 'success' | 'warning' | '' }) {
  return <span className={`pill ${tone}`}>{children}</span>
}
export function Empty({ title, children, action, icon = 'bolt' }: { title: string; children: ReactNode; action?: ReactNode; icon?: IconName }) {
  return <div className="empty"><span className="empty-symbol"><Icon name={icon} size={28} /></span><h3>{title}</h3><p>{children}</p>{action}</div>
}
export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}
export function Dialog({ title, children, onClose, wide = false, drawer = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog?.showModal()
    return () => { dialog?.close(); if (previous instanceof HTMLElement) previous.focus() }
  }, [])
  return <dialog ref={ref} aria-label={title} className={`${wide ? 'wide' : ''} ${drawer ? 'drawer' : ''}`} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose() } }}>
    <div className="dialog-top"><span className="dialog-label">{title}</span><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>
}
export function Field({ label, children, full = false, hint }: { label: string; children: ReactNode; full?: boolean; hint?: string }) {
  return <label className={`field ${full ? 'full' : ''}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
export function Skeleton() {
  return <div className="skeleton-page" aria-label="Loading your sales workspace" aria-busy="true"><div className="skeleton title" /><div className="skeleton-grid">{[1, 2].map(i => <div key={i} className="skeleton tile" />)}</div><div className="skeleton band" /></div>
}
