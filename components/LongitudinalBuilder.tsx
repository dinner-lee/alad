'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type {
  Student,
  StudentXApiData,
  FormulaToken,
  LongitudinalIndicator,
} from '@/lib/types';
import { XAPI_FIELDS } from '@/lib/mockData';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  Calculator,
  Plus,
  Trash2,
  Pencil,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Props {
  students: Student[];
  studentsData: StudentXApiData[];
  selectedStudentId: string; // 'all' 또는 학생 ID
  maxGlobalIndex: number;
}

const STORAGE_KEY = 'alad_longitudinal_indicators';

const FIELD_CATEGORIES = ['참여', '상호작용', '결과/평가', '피드백', '협력학습'] as const;

function evalFormula(
  studentLessonData: { [fieldId: string]: number } | undefined,
  tokens: FormulaToken[],
): number {
  if (!tokens.length || !studentLessonData) return 0;
  let expr = '';
  tokens.forEach((t) => {
    if (t.type === 'field') {
      expr += `(${studentLessonData[t.value] ?? 0})`;
    } else if (t.type === 'function') {
      if (t.value === 'log') expr += 'Math.log10';
      else if (t.value === 'sqrt') expr += 'Math.sqrt';
    } else {
      expr += ` ${t.value} `;
    }
  });
  try {
    const val = new Function(`return ${expr}`)();
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return Math.round(val * 100) / 100;
  } catch {
    return 0;
  }
}

export const LongitudinalBuilder: React.FC<Props> = ({
  students,
  studentsData,
  selectedStudentId,
  maxGlobalIndex,
}) => {
  const [indicators, setIndicators] = useState<LongitudinalIndicator[]>([]);
  const [open, setOpen] = useState(false);

  // 빌더 폼 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tokens, setTokens] = useState<FormulaToken[]>([]);
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [customNum, setCustomNum] = useState('1');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setIndicators(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const persist = (next: LongitudinalIndicator[]) => {
    setIndicators(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addField = (fieldId: string, label: string) => {
    setTokens([...tokens, { type: 'field', value: fieldId, label }]);
  };

  const addOperator = (op: string) => {
    const label = op === '*' ? '×' : op === '/' ? '÷' : op;
    setTokens([...tokens, { type: 'operator', value: op, label }]);
  };

  const addFunction = (fn: 'log' | 'sqrt') => {
    setTokens([
      ...tokens,
      { type: 'function', value: fn, label: fn === 'log' ? 'log₁₀(' : 'sqrt(' },
      { type: 'operator', value: '(', label: '(' },
    ]);
  };

  const addNumber = () => {
    const v = Number(customNum);
    if (isNaN(v)) return;
    setTokens([...tokens, { type: 'number', value: customNum, label: customNum }]);
  };

  const removeTokenAt = (idx: number) => setTokens(tokens.filter((_, i) => i !== idx));
  const clearTokens = () => setTokens([]);

  const onDragStart = (e: React.DragEvent, fieldId: string, label: string) => {
    e.dataTransfer.setData('application/x-alad-field', JSON.stringify({ fieldId, label }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  const onDropFormula = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-alad-field');
    if (!raw) return;
    try {
      const { fieldId, label } = JSON.parse(raw) as { fieldId: string; label: string };
      addField(fieldId, label);
    } catch {}
  };
  const onDragOverFormula = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTokens([]);
    setChartType('line');
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('지표 이름을 입력해 주세요.');
      return;
    }
    if (tokens.length === 0) {
      alert('수식을 먼저 구성해 주세요.');
      return;
    }
    const indicator: LongitudinalIndicator = {
      id: editingId ?? `lind_${Date.now()}`,
      name: name.trim(),
      formula: tokens,
      chartType,
      description: tokens.map((t) => t.label).join(' '),
    };
    const next = editingId
      ? indicators.map((i) => (i.id === editingId ? indicator : i))
      : [...indicators, indicator];
    persist(next);
    resetForm();
  };

  const handleEdit = (ind: LongitudinalIndicator) => {
    setEditingId(ind.id);
    setName(ind.name);
    setTokens(ind.formula);
    setChartType(ind.chartType);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('이 종단 지표를 삭제할까요?')) return;
    persist(indicators.filter((i) => i.id !== id));
    if (editingId === id) resetForm();
  };

  // 차시별 학급 평균 + 선택 학생 시리즈 계산
  const computeSeries = (formula: FormulaToken[]) => {
    const points: Array<{
      lesson: string;
      lessonIdx: number;
      '학급 평균': number;
      '선택 학생'?: number;
    }> = [];
    const selectedStudent =
      selectedStudentId !== 'all'
        ? studentsData.find((s) => s.studentId === selectedStudentId)
        : null;
    for (let idx = 1; idx <= maxGlobalIndex; idx++) {
      const studentVals = studentsData.map((st) => evalFormula(st.lessonsData[idx], formula));
      const avg =
        studentVals.length > 0
          ? Math.round(
              (studentVals.reduce((a, b) => a + b, 0) / studentVals.length) * 100,
            ) / 100
          : 0;
      const point: any = { lesson: `${idx}차시`, lessonIdx: idx, '학급 평균': avg };
      if (selectedStudent) {
        point['선택 학생'] = evalFormula(selectedStudent.lessonsData[idx], formula);
      }
      points.push(point);
    }
    return points;
  };

  const selectedStudentName = useMemo(() => {
    if (selectedStudentId === 'all') return null;
    return students.find((s) => s.id === selectedStudentId)?.name ?? null;
  }, [selectedStudentId, students]);

  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            맞춤형 종단 지표 빌더
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
            {indicators.length}개 저장됨
          </span>
        </span>
        {open ? (
          <ChevronDown size={18} style={{ color: 'var(--text-dim)' }} />
        ) : (
          <ChevronRight size={18} style={{ color: 'var(--text-dim)' }} />
        )}
      </button>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>
        전 차시에 걸쳐 평가할 맞춤형 학습 지표를 수식으로 조립합니다. 좌측에서 칩을 드래그하거나
        클릭하여 추가하세요. 저장한 지표는 학급 평균/선택 학생의 종단 추이로 시각화됩니다.
      </p>

      {open && (
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18 }}>
          {/* 좌측: xAPI 필드 사전 */}
          <div
            style={{
              maxHeight: 420,
              overflowY: 'auto',
              padding: 12,
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)' }}>
              xAPI 로그 데이터 목록
            </span>
            {FIELD_CATEGORIES.map((cat) => (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    borderLeft: '3px solid var(--color-primary)',
                    paddingLeft: 6,
                  }}
                >
                  {cat} 로그
                </span>
                {XAPI_FIELDS.filter((f) => f.category === cat).map((f) => (
                  <div
                    key={f.id}
                    className="field-chip"
                    draggable
                    onDragStart={(e) => onDragStart(e, f.id, f.label)}
                    onClick={() => addField(f.id, f.label)}
                    title="끌어다 놓거나 클릭하여 수식에 추가"
                    style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                  >
                    <span style={{ fontWeight: 500 }}>{f.label}</span>
                    <span className="unit-pill unit-pill-sm" title={`단위: ${f.unit}`}>{f.unit}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 우측: 빌더 폼 + 미리보기 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">종단 지표 이름</label>
              <input
                className="form-input"
                placeholder="예: 학기 누적 협력 적극성 지수"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: 6 }}>
                연산자 및 함수
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['+', '-', '*', '/'].map((op) => (
                  <button
                    key={op}
                    className="btn btn-secondary"
                    style={{ minWidth: 36, padding: '6px 10px', fontSize: '0.85rem' }}
                    onClick={() => addOperator(op)}
                  >
                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                  </button>
                ))}
                {['(', ')'].map((p) => (
                  <button
                    key={p}
                    className="btn btn-secondary"
                    style={{ minWidth: 36, padding: '6px 10px', fontSize: '0.85rem' }}
                    onClick={() => addOperator(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  onClick={() => addFunction('log')}
                >
                  log₁₀(x)
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  onClick={() => addFunction('sqrt')}
                >
                  sqrt(x)
                </button>
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  <input
                    className="form-input"
                    style={{ width: 56, padding: '6px 8px', fontSize: '0.85rem', textAlign: 'center' }}
                    value={customNum}
                    onChange={(e) => setCustomNum(e.target.value)}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    onClick={addNumber}
                  >
                    상수 추가
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`formula-display-area ${tokens.length > 0 ? 'active' : ''}`}
              onDrop={onDropFormula}
              onDragOver={onDragOverFormula}
              style={{ minHeight: 70 }}
            >
              {tokens.length === 0 ? (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  왼쪽 사전에서 칩을 드래그하거나 클릭하여 수식을 작성하세요.
                </span>
              ) : (
                tokens.map((t, i) => {
                  let cls = 'token-field';
                  if (t.type === 'operator') cls = 'token-operator';
                  if (t.type === 'function') cls = 'token-function';
                  if (t.type === 'number') cls = 'token-number';
                  return (
                    <div key={i} className={`formula-token ${cls}`}>
                      <span>{t.label}</span>
                      <button
                        type="button"
                        className="token-remove"
                        onClick={() => removeTokenAt(i)}
                        aria-label="토큰 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>시각화:</span>
                {(['line', 'area'] as const).map((t) => (
                  <button
                    key={t}
                    className={`btn ${chartType === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                    onClick={() => setChartType(t)}
                  >
                    {t === 'line' ? '꺾은선' : '영역형'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {tokens.length > 0 && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.78rem', gap: 4 }}
                    onClick={clearTokens}
                  >
                    <RotateCcw size={12} /> 초기화
                  </button>
                )}
                {editingId && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                    onClick={resetForm}
                  >
                    신규로 전환
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', gap: 4 }}
                  onClick={handleSave}
                >
                  <Plus size={14} />
                  {editingId ? '수정 저장' : '종단 지표 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 저장된 종단 지표 차트들 */}
      {indicators.length > 0 && (
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-color)',
              paddingTop: 14,
            }}
          >
            <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              저장된 맞춤형 종단 지표 ({indicators.length})
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {selectedStudentName
                ? `학급 평균 vs ${selectedStudentName}`
                : '학급 평균 추이만 표시 (학생 선택 시 비교)'}
            </span>
          </div>

          {indicators.map((ind) => {
            const data = computeSeries(ind.formula);
            return (
              <div
                key={ind.id}
                className="glass-card"
                style={{ padding: 14, background: '#ffffff' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                      {ind.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      수식: {ind.description}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', gap: 3 }}
                      onClick={() => handleEdit(ind)}
                    >
                      <Pencil size={11} /> 편집
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', gap: 3 }}
                      onClick={() => handleDelete(ind.id)}
                    >
                      <Trash2 size={11} /> 삭제
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {ind.chartType === 'line' ? (
                      <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                        <XAxis dataKey="lesson" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.78rem' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line
                          type="monotone"
                          dataKey="학급 평균"
                          stroke="var(--color-primary)"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        {selectedStudentName && (
                          <Line
                            type="monotone"
                            dataKey="선택 학생"
                            stroke="var(--color-secondary)"
                            strokeWidth={2.5}
                            dot={{ r: 4 }}
                            name={selectedStudentName}
                          />
                        )}
                      </LineChart>
                    ) : (
                      <AreaChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`g-${ind.id}-a`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id={`g-${ind.id}-b`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
                        <XAxis dataKey="lesson" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.78rem' }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area
                          type="monotone"
                          dataKey="학급 평균"
                          stroke="var(--color-primary)"
                          fill={`url(#g-${ind.id}-a)`}
                          strokeWidth={2}
                        />
                        {selectedStudentName && (
                          <Area
                            type="monotone"
                            dataKey="선택 학생"
                            stroke="var(--color-secondary)"
                            fill={`url(#g-${ind.id}-b)`}
                            strokeWidth={2}
                            name={selectedStudentName}
                          />
                        )}
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
