'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { REFEICOES, AGUA_COPOS, AGUA_ML_POR_COPO } from '../lib/dieta'

const USER_ID = 'eduardo'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

function emptyDay() {
  const checks = {}
  const opcoes = {}
  const notas = {}
  REFEICOES.forEach(r => {
    checks[r.id] = false
    opcoes[r.id] = null
    notas[r.id] = ''
    if (r.tipo === 'checklist' && r.opcoes) {
      r.opcoes.forEach((_, i) => { checks[`${r.id}_${i}`] = false })
    }
    if (r.tipo === 'estruturado' && r.estrutura) {
      r.estrutura.forEach((_, i) => { checks[`${r.id}_item_${i}`] = false })
    }
  })
  return { checks, opcoes, notas, agua: 0 }
}

async function dbLoad(dateKey) {
  const { data } = await supabase
    .from('dieta_dias')
    .select('data')
    .eq('user_id', USER_ID)
    .eq('date_key', dateKey)
    .single()
  return data?.data || emptyDay()
}

async function dbSave(dateKey, dayData) {
  await supabase
    .from('dieta_dias')
    .upsert({ user_id: USER_ID, date_key: dateKey, data: dayData }, { onConflict: 'user_id,date_key' })
}

function AguaTracker({ copos, onChange }) {
  const pct = Math.round((copos / AGUA_COPOS) * 100)
  const ml = copos * AGUA_ML_POR_COPO
  const cor = copos >= AGUA_COPOS ? '#1A7A5E' : copos >= AGUA_COPOS * 0.6 ? '#2563EB' : '#60A5FA'

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>💧 Água</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>Meta: {AGUA_COPOS} copos · {AGUA_COPOS * AGUA_ML_POR_COPO / 1000}L</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: cor }}>{ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{pct}% da meta</div>
        </div>
      </div>
      <div style={{ height: 8, background: '#F0EEE9', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: cor, borderRadius: 4, transition: 'width .3s' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {Array.from({ length: AGUA_COPOS }, (_, i) => {
          const filled = i < copos
          return (
            <button
              key={i}
              onClick={() => onChange(filled ? i : i + 1)}
              style={{
                padding: '10px 0', borderRadius: 10, border: 'none',
                background: filled ? '#DBEAFE' : '#F7F6F3',
                cursor: 'pointer', fontSize: 18,
                WebkitTapHighlightColor: 'transparent',
                transition: 'background .15s',
              }}
            >
              {filled ? '🥤' : '🫙'}
            </button>
          )
        })}
      </div>
      {copos >= AGUA_COPOS && (
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#1A7A5E', fontWeight: 500 }}>
          ✓ Meta batida! 💪
        </div>
      )}
    </div>
  )
}

function RefeicaoCard({ refeicao, dayData, onChange }) {
  const [open, setOpen] = useState(false)
  const [opcaoOpen, setOpcaoOpen] = useState(false)

  const checked = dayData.checks?.[refeicao.id] || false
  const opcaoSelecionada = dayData.opcoes?.[refeicao.id] || null
  const nota = dayData.notas?.[refeicao.id] || ''

  function toggleCheck() { onChange('checks', refeicao.id, !checked) }
  function selectOpcao(opcao) {
    onChange('opcoes', refeicao.id, opcao === opcaoSelecionada ? null : opcao)
    setOpcaoOpen(false)
  }
  function setNota(val) { onChange('notas', refeicao.id, val) }

  return (
    <div style={{
      background: '#fff', border: `1px solid ${checked ? '#BBF7D0' : '#E8E6E1'}`,
      borderRadius: 14, marginBottom: 10, overflow: 'hidden', transition: 'border-color .2s',
    }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div
          onClick={e => { e.stopPropagation(); toggleCheck() }}
          style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            border: checked ? 'none' : '1.5px solid #ccc',
            background: checked ? '#1A7A5E' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          {checked && <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>✓</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{refeicao.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 700, textDecoration: checked ? 'line-through' : 'none', color: checked ? '#aaa' : '#1a1a1a' }}>
              {refeicao.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>{refeicao.horario}</div>
          {opcaoSelecionada && !open && (
            <div style={{ fontSize: 12, color: '#2563EB', marginTop: 4, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ✓ {opcaoSelecionada.length > 50 ? opcaoSelecionada.slice(0, 50) + '…' : opcaoSelecionada}
            </div>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#bbb', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F0EEE9' }}>
          {refeicao.tipo === 'fixo' && (
            <div style={{ marginTop: 12, fontSize: 14, color: '#444', lineHeight: 1.6, background: '#F7F6F3', borderRadius: 10, padding: '10px 12px' }}>
              {refeicao.descricao}
            </div>
          )}

          {refeicao.tipo === 'opcoes' && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setOpcaoOpen(o => !o)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: '1px solid #2563EB', background: opcaoSelecionada ? '#EFF6FF' : '#fff',
                  color: '#2563EB', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span>{opcaoSelecionada ? opcaoSelecionada.slice(0, 45) + (opcaoSelecionada.length > 45 ? '…' : '') : 'Escolher opção do cardápio…'}</span>
                <span>{opcaoOpen ? '▲' : '▼'}</span>
              </button>
              {opcaoOpen && (
                <div style={{ marginTop: 6, border: '1px solid #E8E6E1', borderRadius: 10, overflow: 'hidden' }}>
                  {refeicao.opcoes.map((op, i) => (
                    <div
                      key={i}
                      onClick={() => selectOpcao(op)}
                      style={{
                        padding: '12px 14px', fontSize: 13, color: '#333', lineHeight: 1.5,
                        background: opcaoSelecionada === op ? '#EFF6FF' : '#fff',
                        borderBottom: i < refeicao.opcoes.length - 1 ? '1px solid #F0EEE9' : 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10,
                      }}
                    >
                      <span style={{ color: opcaoSelecionada === op ? '#2563EB' : '#ddd', flexShrink: 0, marginTop: 1 }}>
                        {opcaoSelecionada === op ? '●' : '○'}
                      </span>
                      {op}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {refeicao.tipo === 'estruturado' && (
            <div style={{ marginTop: 12 }}>
              {refeicao.estrutura.map((item, i) => {
                const itemKey = `${refeicao.id}_item_${i}`
                const itemChecked = dayData.checks?.[itemKey] || false
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < refeicao.estrutura.length - 1 ? '1px solid #F7F6F3' : 'none' }}>
                    <div
                      onClick={() => onChange('checks', itemKey, !itemChecked)}
                      style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                        border: itemChecked ? 'none' : '1.5px solid #ccc',
                        background: itemChecked ? '#1A7A5E' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {itemChecked && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: itemChecked ? '#aaa' : '#333', textDecoration: itemChecked ? 'line-through' : 'none' }}>{item.nome}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2, lineHeight: 1.5 }}>{item.detalhe}</div>
                    </div>
                  </div>
                )
              })}
              {refeicao.opcoesAlternativas && (
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => setOpcaoOpen(o => !o)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px dashed #ccc', background: opcaoSelecionada ? '#EFF6FF' : '#FAFAF8',
                      color: '#666', fontSize: 12, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between',
                    }}
                  >
                    <span>{opcaoSelecionada ? `Alternativa: ${opcaoSelecionada.slice(0, 40)}…` : 'Ou escolher opção alternativa…'}</span>
                    <span>{opcaoOpen ? '▲' : '▼'}</span>
                  </button>
                  {opcaoOpen && (
                    <div style={{ marginTop: 4, border: '1px solid #E8E6E1', borderRadius: 8, overflow: 'hidden' }}>
                      {refeicao.opcoesAlternativas.map((op, i) => (
                        <div
                          key={i}
                          onClick={() => selectOpcao(op)}
                          style={{
                            padding: '10px 12px', fontSize: 12, color: '#444', lineHeight: 1.5,
                            background: opcaoSelecionada === op ? '#EFF6FF' : '#fff',
                            borderBottom: i < refeicao.opcoesAlternativas.length - 1 ? '1px solid #F0EEE9' : 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {op}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {refeicao.tipo === 'checklist' && refeicao.opcoes && (
            <div style={{ marginTop: 12 }}>
              {refeicao.opcoes.map((op, i) => {
                const k = `${refeicao.id}_${i}`
                const v = dayData.checks?.[k] || false
                return (
                  <div key={i} onClick={() => onChange('checks', k, !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < refeicao.opcoes.length - 1 ? '1px solid #F7F6F3' : 'none', cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, border: v ? 'none' : '1.5px solid #ccc', background: v ? '#1A7A5E' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {v && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: v ? '#aaa' : '#333', textDecoration: v ? 'line-through' : 'none' }}>{op}</span>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>Observações</div>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ex: comi frango grelhado, usei azeite extra..."
              rows={2}
              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #E8E6E1', borderRadius: 8, resize: 'vertical', outline: 'none', color: '#444', fontFamily: 'inherit', background: '#FAFAF8', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function DietaApp() {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [dayData, setDayData] = useState(emptyDay())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    dbLoad(selectedDate).then(data => {
      setDayData(data || emptyDay())
      setLoading(false)
    })
  }, [selectedDate])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const persist = useCallback((data) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      await dbSave(selectedDate, data)
      setSaving(false)
      showToast('Salvo ✓')
    }, 800)
  }, [selectedDate])

  function handleChange(field, key, value) {
    setDayData(prev => {
      const updated = { ...prev, [field]: { ...prev[field], [key]: value } }
      persist(updated)
      return updated
    })
  }

  function handleAgua(copos) {
    setDayData(prev => {
      const updated = { ...prev, agua: copos }
      persist(updated)
      return updated
    })
  }

  function changeDay(dir) {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() + dir)
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (newKey > todayKey()) return
    setSelectedDate(newKey)
  }

  const isToday = selectedDate === todayKey()
  const totalRef = REFEICOES.filter(r => r.tipo !== 'checklist').length
  const doneRef = REFEICOES.filter(r => r.tipo !== 'checklist' && dayData.checks?.[r.id]).length
  const pctRef = Math.round((doneRef / totalRef) * 100)

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 14, color: '#aaa' }}>
      <div style={{ fontSize: 36 }}>🥗</div>
      <div style={{ fontSize: 14 }}>Carregando dieta...</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 14px 60px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#1A7A5E', color: '#fff', fontSize: 14, padding: '10px 22px', borderRadius: 10, zIndex: 100, fontWeight: 500, whiteSpace: 'nowrap' }}>{toast}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>Diário de Dieta</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            {fmtDayLabel(selectedDate)}
            {isToday && <span style={{ background: '#E0F5EC', color: '#1A7A5E', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>HOJE</span>}
            {saving && <span style={{ color: '#2563EB', fontSize: 11 }}>● salvando…</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => changeDay(-1)} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', color: '#555' }}>← ant.</button>
          <button onClick={() => changeDay(1)} disabled={isToday} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: isToday ? 'default' : 'pointer', color: isToday ? '#ccc' : '#555' }}>próx. →</button>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>🍽️ Refeições do dia</div>
          <div style={{ fontSize: 13, color: pctRef === 100 ? '#1A7A5E' : '#888', fontWeight: 500 }}>{doneRef}/{totalRef}</div>
        </div>
        <div style={{ height: 8, background: '#F0EEE9', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctRef}%`, background: pctRef === 100 ? '#1A7A5E' : '#2563EB', borderRadius: 4, transition: 'width .3s' }} />
        </div>
        {pctRef === 100 && <div style={{ fontSize: 12, color: '#1A7A5E', fontWeight: 500, marginTop: 8, textAlign: 'center' }}>✓ Todas as refeições feitas! 🎉</div>}
      </div>
      <AguaTracker copos={dayData.agua || 0} onChange={handleAgua} />
      {REFEICOES.map(r => (
        <RefeicaoCard key={r.id} refeicao={r} dayData={dayData} onChange={handleChange} />
      ))}
    </div>
  )
}
