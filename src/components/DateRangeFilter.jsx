import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'

const presets = [
  { label: '7 días', dias: 7 },
  { label: '30 días', dias: 30 },
  { label: '90 días', dias: 90 },
  { label: 'Este mes', dias: null, fn: () => {
    const now = new Date()
    return { desde: new Date(now.getFullYear(), now.getMonth(), 1), hasta: now }
  }},
  { label: 'Mes anterior', dias: null, fn: () => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last = new Date(now.getFullYear(), now.getMonth(), 0)
    return { desde: first, hasta: last }
  }},
]

export default function DateRangeFilter({ onChange }) {
  const [activePreset, setActivePreset] = useState(1)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  useEffect(() => {
    applyPreset(presets[1])
  }, [])

  function applyPreset(p) {
    setActivePreset(presets.indexOf(p))
    let d, h
    if (p.fn) {
      const r = p.fn()
      d = r.desde
      h = r.hasta
    } else {
      h = new Date()
      d = new Date(h.getTime() - p.dias * 24 * 60 * 60 * 1000)
    }
    const fmt = (date) => date.toISOString().slice(0, 10)
    setDesde(fmt(d))
    setHasta(fmt(h))
    if (onChange) onChange({ desde: fmt(d), hasta: fmt(h) })
  }

  function handleApply() {
    setActivePreset(-1)
    if (onChange) onChange({ desde, hasta })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      {presets.map((p, i) => (
        <Button
          key={p.label}
          variant={activePreset === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => applyPreset(p)}
        >
          {p.label}
        </Button>
      ))}
      <input
        type="date"
        value={desde}
        onChange={(e) => { setDesde(e.target.value); setActivePreset(-1) }}
        className="h-8 rounded-md border bg-transparent px-2 text-xs"
      />
      <span className="text-xs text-muted-foreground">—</span>
      <input
        type="date"
        value={hasta}
        onChange={(e) => { setHasta(e.target.value); setActivePreset(-1) }}
        className="h-8 rounded-md border bg-transparent px-2 text-xs"
      />
      {activePreset === -1 && (
        <Button variant="secondary" size="sm" onClick={handleApply}>Aplicar</Button>
      )}
    </div>
  )
}
