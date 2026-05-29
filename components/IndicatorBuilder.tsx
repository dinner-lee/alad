'use client';

import React, { useState, useEffect } from 'react';
import type { Lesson, FormulaToken, CustomIndicator, StudentXApiData, ChartType } from '@/lib/types';
import { XAPI_FIELDS } from '@/lib/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Label, LineChart, Line,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import {
  Sparkles, Plus, RotateCcw, ChartBar, Trash2, Eye, Calculator
} from 'lucide-react';

// 파이차트 분위 색 팔레트
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

interface ChartRowDatum {
  studentId: string;
  studentName: string;
  value: number;
  xScatter: number;
}

/**
 * 미리보기 차트 렌더러 — 모든 차트 타입(bar/line/scatter/pie/histogram)을 분기 처리.
 * - pie: 학생들을 사분위(상위 25% / 중상 / 중하 / 하위 25%)로 묶어 비율 표시
 * - histogram: 값을 8개 구간으로 분할 후 구간별 학생 수 막대 표시
 */
function renderPreviewChart({
  type,
  data,
  scatterXField,
  indicatorName,
}: {
  type: ChartType;
  data: ChartRowDatum[];
  scatterXField: string;
  indicatorName: string;
}): React.ReactElement {
  const baseAxis = { fill: 'var(--text-muted)', fontSize: 11 } as const;
  const tooltipStyle = {
    background: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '0.78rem',
  } as const;

  if (type === 'bar') {
    return (
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
        <XAxis dataKey="studentName" tick={baseAxis} />
        <YAxis tick={baseAxis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  }

  if (type === 'line') {
    return (
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
        <XAxis dataKey="studentName" tick={baseAxis} />
        <YAxis tick={baseAxis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="value" stroke="var(--color-secondary)" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    );
  }

  if (type === 'scatter') {
    const xLabel = XAPI_FIELDS.find((f) => f.id === scatterXField)?.label || scatterXField;
    return (
      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
        <XAxis type="number" dataKey="xScatter" name={xLabel} tick={baseAxis}>
          <Label
            value={xLabel}
            offset={-6}
            position="insideBottom"
            style={{ fill: 'var(--text-muted)', fontSize: 11 }}
          />
        </XAxis>
        <YAxis type="number" dataKey="value" name={indicatorName || '지표 점수'} tick={baseAxis} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
        <Scatter name="학생 분포" data={data} fill="var(--color-info)" />
      </ScatterChart>
    );
  }

  if (type === 'pie') {
    // 사분위 구간 계산
    const vals = data.map((d) => d.value).sort((a, b) => a - b);
    const n = vals.length;
    const q1 = vals[Math.floor(n * 0.25)] ?? 0;
    const q2 = vals[Math.floor(n * 0.5)] ?? 0;
    const q3 = vals[Math.floor(n * 0.75)] ?? 0;
    const buckets = [
      { name: '상위 25%', value: 0 },
      { name: '상위 50%', value: 0 },
      { name: '하위 50%', value: 0 },
      { name: '하위 25%', value: 0 },
    ];
    data.forEach((d) => {
      if (d.value >= q3) buckets[0].value++;
      else if (d.value >= q2) buckets[1].value++;
      else if (d.value >= q1) buckets[2].value++;
      else buckets[3].value++;
    });
    return (
      <PieChart>
        <Pie data={buckets} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label={(e: any) => `${e.value}명`}>
          {buckets.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [`${v}명`, n]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    );
  }

  if (type === 'histogram') {
    // 값 분포 8구간 빈도
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 8;
    const range = max - min || 1;
    const binSize = range / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(0)}~${(min + (i + 1) * binSize).toFixed(0)}`,
      학생수: 0,
    }));
    vals.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      bins[idx].학생수++;
    });
    return (
      <BarChart data={bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
        <XAxis dataKey="range" tick={baseAxis} />
        <YAxis tick={baseAxis} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}명`, '학생수']} />
        <Bar dataKey="학생수" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  }

  return <></> as React.ReactElement;
}

interface Props {
  selectedLesson: Lesson | null;
  lessons: Lesson[];
  onUpdateLesson: (lesson: Lesson) => void;
  studentsData: StudentXApiData[];
  /** 학급 상세 내부에서 단일 차시에 고정 임베드된 경우 헤더/차시선택을 숨김 */
  embedded?: boolean;
  /** 저장 직후 호출 (모달 자동 닫기 등) */
  onAfterSave?: () => void;
}

export const IndicatorBuilder: React.FC<Props> = ({
  selectedLesson,
  lessons,
  embedded,
  onAfterSave,
  onUpdateLesson,
  studentsData 
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(selectedLesson);
  const [indicatorName, setIndicatorName] = useState('');
  const [formulaTokens, setFormulaTokens] = useState<FormulaToken[]>([]);
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [customIndicators, setCustomIndicators] = useState<CustomIndicator[]>([]);
  
  // Scatter Plot axis selectors
  const [scatterXField, setScatterXField] = useState('page_views');
  const [activeIndicatorId, setActiveIndicatorId] = useState<string | null>(null);

  // Custom number state to add custom weight/multiplier
  const [customNum, setCustomNum] = useState('1');

  useEffect(() => {
    if (selectedLesson) {
      setActiveLesson(selectedLesson);
      setCustomIndicators(selectedLesson.customIndicators || []);
      // Reset builder
      setIndicatorName('');
      setFormulaTokens([]);
      setActiveIndicatorId(null);
    }
  }, [selectedLesson]);

  // Standard calculation logic for a student on current formula
  const calculateFormulaValue = (studentData: { [fieldId: string]: number }, tokens: FormulaToken[]) => {
    if (tokens.length === 0) return 0;
    
    let expr = '';
    tokens.forEach((t) => {
      if (t.type === 'field') {
        expr += `(${studentData[t.value] ?? 0})`;
      } else if (t.type === 'function') {
        if (t.value === 'log') {
          expr += 'Math.log10';
        } else if (t.value === 'mean') {
          // Single-student fallback for mean: raw value multiplied by 0.95
          expr += 'Math.sqrt';
        }
      } else {
        expr += ` ${t.value} `;
      }
    });

    try {
      // safe eval using Function since input tokens are restricted to UI selections
      const val = new Function(`return ${expr}`)();
      if (isNaN(val) || !isFinite(val)) return 0;
      return Math.round(val * 100) / 100;
    } catch {
      return 0;
    }
  };

  // Preset recommended indicators based on active activity types
  const getRecommendedPresets = () => {
    if (!activeLesson) return [];
    const { format } = activeLesson.activityTypes;
    const presets: { name: string; formula: FormulaToken[]; chartType: ChartType; desc: string }[] = [];

    if (format.includes('퀴즈')) {
      presets.push({
        name: '퀴즈 성적 대비 성찰성 (피드백 확인 빈도)',
        desc: '퀴즈 평가 점수와 교사 피드백 확인 횟수를 곱하여 피드백 수용도를 가늠합니다.',
        chartType: 'scatter',
        formula: [
          { type: 'field', value: 'quiz_score', label: '퀴즈 평가 점수' },
          { type: 'operator', value: '*', label: '×' },
          { type: 'field', value: 'feedback_views', label: '피드백 확인 횟수' }
        ]
      });
      presets.push({
        name: '퀴즈 몰입 속도 지표',
        desc: '퀴즈 평가 점수를 과제 제출 속도로 나누어 신속도와 완결성을 동시 분석합니다.',
        chartType: 'bar',
        formula: [
          { type: 'field', value: 'quiz_score', label: '퀴즈 평가 점수' },
          { type: 'operator', value: '/', label: '÷' },
          { type: 'field', value: 'assignment_sub_time', label: '과제 제출 속도' }
        ]
      });
    }

    if (format.includes('토의') || format.includes('토론')) {
      presets.push({
        name: '토의 의견 작성 및 열람 소통 지수',
        desc: '댓글 작성 수, 댓글 조회 수, 상호작용 지수의 총합으로 온라인 소통량을 평가합니다.',
        chartType: 'bar',
        formula: [
          { type: 'field', value: 'comment_writes', label: '의견/댓글 작성 횟수' },
          { type: 'operator', value: '+', label: '+' },
          { type: 'field', value: 'comment_views', label: '동료 댓글 조회 횟수' },
          { type: 'operator', value: '+', label: '+' },
          { type: 'field', value: 'interaction_score', label: '의사소통 상호작용수' }
        ]
      });
      presets.push({
        name: '토의 주도력 분석 (자료 공유와 피드백)',
        desc: '댓글 작성 횟수에 모둠 공유 자료 수를 가중치로 곱해 산출합니다.',
        chartType: 'scatter',
        formula: [
          { type: 'field', value: 'comment_writes', label: '의견/댓글 작성 횟수' },
          { type: 'operator', value: '*', label: '×' },
          { type: 'field', value: 'shared_materials', label: '모둠 공유 자료수' }
        ]
      });
    }

    if (format.includes('글쓰기') || format.includes('창작')) {
      presets.push({
        name: '글쓰기 수정 정성도',
        desc: '과제 수정 보완 횟수에 에세이 글자수를 곱하여 성실성을 파악합니다.',
        chartType: 'bar',
        formula: [
          { type: 'field', value: 'assignment_edits', label: '과제 수정 보완 횟수' },
          { type: 'operator', value: '*', label: '×' },
          { type: 'field', value: 'writing_score', label: '글쓰기 본문 자수' }
        ]
      });
    }

    // Default
    presets.push({
      name: '단순 학습 접속 효율',
      desc: '접속 시간 대비 페이지 열람 횟수 분석 (열람 횟수 / 접속 시간 * 100).',
      chartType: 'line',
      formula: [
        { type: 'field', value: 'page_views', label: '페이지 열람 횟수' },
        { type: 'operator', value: '/', label: '÷' },
        { type: 'field', value: 'session_duration', label: '페이지 접속 시간' },
        { type: 'operator', value: '*', label: '×' },
        { type: 'number', value: '100', label: '100' }
      ]
    });

    return presets;
  };

  const handleApplyPreset = (preset: { name: string; formula: FormulaToken[]; chartType: ChartType; desc: string }) => {
    setIndicatorName(preset.name);
    setFormulaTokens(preset.formula);
    setSelectedChartType(preset.chartType);
  };

  // Add formula tokens
  const addFieldToken = (fieldId: string, label: string) => {
    const token: FormulaToken = { type: 'field', value: fieldId, label };
    setFormulaTokens([...formulaTokens, token]);
  };

  // ---- Drag & drop helpers ----
  const handleDragStartField = (e: React.DragEvent, fieldId: string, label: string) => {
    e.dataTransfer.setData('application/x-alad-field', JSON.stringify({ fieldId, label }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropOnFormula = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-alad-field');
    if (!raw) return;
    try {
      const { fieldId, label } = JSON.parse(raw) as { fieldId: string; label: string };
      addFieldToken(fieldId, label);
    } catch (err) {
      console.error('드롭 데이터 파싱 실패', err);
    }
  };

  const handleDragOverFormula = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const removeTokenAt = (index: number) => {
    setFormulaTokens(formulaTokens.filter((_, i) => i !== index));
  };

  const addOperatorToken = (op: string) => {
    const token: FormulaToken = { type: 'operator', value: op, label: op === '*' ? '×' : op === '/' ? '÷' : op };
    setFormulaTokens([...formulaTokens, token]);
  };

  const addFuncToken = (fn: string) => {
    // log10( or sqrt( 
    const label = fn === 'log' ? 'log10(' : 'sqrt(';
    setFormulaTokens([
      ...formulaTokens,
      { type: 'function', value: fn, label },
      { type: 'operator', value: '(', label: '(' }
    ]);
  };

  const addNumToken = () => {
    const val = Number(customNum);
    if (isNaN(val)) return;
    setFormulaTokens([...formulaTokens, { type: 'number', value: customNum, label: customNum }]);
  };

  const deleteLastToken = () => {
    setFormulaTokens(formulaTokens.slice(0, -1));
  };

  const clearFormula = () => {
    setFormulaTokens([]);
  };

  // Save the custom indicator to current lesson
  const handleSaveIndicator = () => {
    if (!activeLesson) return;
    if (!indicatorName.trim()) {
      alert('지표 이름을 입력해주세요.');
      return;
    }
    if (formulaTokens.length === 0) {
      alert('수식을 먼저 구성해주세요.');
      return;
    }

    const newIndicator: CustomIndicator = {
      id: activeIndicatorId || `ind_${Date.now()}`,
      name: indicatorName,
      formula: formulaTokens,
      chartType: selectedChartType,
      description: `교사 커스텀 학습지표: ${formulaTokens.map(t => t.label).join(' ')}`
    };

    let updatedIndicators = [];
    if (activeIndicatorId) {
      // Edit mode
      updatedIndicators = customIndicators.map(ind => ind.id === activeIndicatorId ? newIndicator : ind);
    } else {
      // Add mode
      updatedIndicators = [...customIndicators, newIndicator];
    }

    setCustomIndicators(updatedIndicators);
    
    // Save to lesson
    const updatedLesson = {
      ...activeLesson,
      customIndicators: updatedIndicators
    };
    onUpdateLesson(updatedLesson);
    
    // Reset builder form
    setIndicatorName('');
    setFormulaTokens([]);
    setActiveIndicatorId(null);
    if (onAfterSave) {
      onAfterSave();
    } else {
      alert('학습분석 지표가 성공적으로 저장되었습니다!');
    }
  };

  const handleDeleteIndicator = (indId: string) => {
    if (!activeLesson) return;
    if (!window.confirm('이 지표를 정말 삭제하시겠습니까?')) return;

    const updated = customIndicators.filter(i => i.id !== indId);
    setCustomIndicators(updated);
    
    const updatedLesson = {
      ...activeLesson,
      customIndicators: updated
    };
    onUpdateLesson(updatedLesson);
  };

  const handleEditIndicator = (ind: CustomIndicator) => {
    setActiveIndicatorId(ind.id);
    setIndicatorName(ind.name);
    setFormulaTokens(ind.formula);
    setSelectedChartType(ind.chartType as any);
  };

  // Generate chart data based on simulated students
  const getChartData = () => {
    if (!activeLesson) return [];
    
    const globalIdx = activeLesson.globalIndex;
    
    return studentsData.map(st => {
      const lessonData = st.lessonsData[globalIdx] || {};
      const calculatedVal = calculateFormulaValue(lessonData, formulaTokens);
      
      return {
        studentId: st.studentId,
        studentName: st.studentName,
        value: calculatedVal,
        xScatter: lessonData[scatterXField] ?? 0
      };
    });
  };

  const chartData = getChartData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 간결한 섹션 헤더 + 차시 선택 (embedded 모드면 숨김) */}
      {!embedded && (
        <div className="section-header">
          <div>
            <h2>
              <Calculator size={22} style={{ color: 'var(--color-primary)' }} />
              차시별 인사이트 · 지표 빌더
            </h2>
            <p>
              xAPI 로그 데이터를 드래그하여 수식을 조립하고, 학급 분포를 즉시 시뮬레이션합니다.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>대상 차시 선택:</span>
            <select
              className="form-select"
              value={activeLesson?.id || ''}
              onChange={(e) => {
                const found = lessons.find(l => l.id === e.target.value);
                if (found) {
                  setActiveLesson(found);
                  setCustomIndicators(found.customIndicators || []);
                }
              }}
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>
                  {l.globalIndex}차시 (학습형태: {l.activityTypes.format.join(', ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeLesson ? (
        <div className={`builder-grid${embedded ? ' compact' : ''}`}>
          
          {/* Left Panel: Available xAPI Log Data & Controls */}
          <div className="glass-panel fields-panel">
            <h3 className="builder-section-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <Sparkles size={15} style={{ color: 'var(--color-info)' }} />
              xAPI 로그 데이터 목록
            </h3>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
              💡 데이터 칩을 <strong style={{ color: 'var(--color-primary)' }}>오른쪽 수식 영역으로 끌어다 놓거나</strong>, 클릭하여 수식에 추가할 수 있습니다.
            </p>

            {/* Categories */}
            {['참여', '상호작용', '결과/평가', '피드백', '협력학습'].map(cat => (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', borderLeft: '3px solid var(--color-primary)', paddingLeft: '8px' }}>
                  {cat} 로그
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {XAPI_FIELDS.filter(f => f.category === cat).map(f => (
                    <div
                      key={f.id}
                      className="field-chip"
                      draggable
                      onDragStart={(e) => handleDragStartField(e, f.id, f.label)}
                      onClick={() => addFieldToken(f.id, f.label)}
                      title="끌어다 놓거나 클릭하여 수식에 추가"
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{f.label}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{f.description}</span>
                      </div>
                      <span className="unit-pill" title={`단위: ${f.unit}`}>{f.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel: Custom Formula Builder & Chart Simulation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: embedded ? 14 : 24 }}>

            {/* 1. 추천 지표 (한 줄 압축형) */}
            <div
              className="glass-panel"
              style={{
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={13} style={{ color: 'var(--color-info)' }} />
                추천 지표
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                클릭 시 수식 영역에 즉시 로드
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginLeft: 'auto' }}>
                {getRecommendedPresets().map((preset, idx) => (
                  <button
                    key={idx}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '3px 9px' }}
                    onClick={() => handleApplyPreset(preset)}
                    title={preset.desc}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 지표 수식 빌더 */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="builder-section-title">
                  <Calculator size={15} style={{ color: 'var(--color-primary)' }} />
                  지표 계산식 구성기 {activeIndicatorId ? '(수정 모드)' : ''}
                </h3>
                {activeIndicatorId && (
                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => {
                    setActiveIndicatorId(null);
                    setIndicatorName('');
                    setFormulaTokens([]);
                  }}>
                    신규 작성 전환
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">지표 이름</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={indicatorName}
                  onChange={(e) => setIndicatorName(e.target.value)}
                  placeholder="예: 퀴즈대비_피드백확인성실성"
                />
              </div>

              {/* Formula Tool Box */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>계산 연산자 및 함수</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {/* Basic Operators */}
                  {['+', '-', '*', '/'].map(op => (
                    <button key={op} className="btn btn-secondary" style={{ minWidth: '40px', padding: '8px' }} onClick={() => addOperatorToken(op)}>
                      {op === '*' ? '×' : op === '/' ? '÷' : op}
                    </button>
                  ))}
                  {/* Parentheses */}
                  {['(', ')'].map(p => (
                    <button key={p} className="btn btn-secondary" style={{ minWidth: '40px', padding: '8px' }} onClick={() => addOperatorToken(p)}>
                      {p}
                    </button>
                  ))}
                  {/* Math Functions */}
                  <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => addFuncToken('log')}>
                    log₁₀(x)
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={() => addFuncToken('mean')}>
                    sqrt(x)
                  </button>
                  
                  {/* Constant Number Input */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 'auto' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ width: '60px', padding: '8px', textAlign: 'center' }} 
                      value={customNum}
                      onChange={(e) => setCustomNum(e.target.value)}
                      placeholder="수치"
                    />
                    <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={addNumToken}>
                      상수 추가
                    </button>
                  </div>
                </div>

                {/* Formula Display Workspace - 드롭 영역 */}
                <div style={{ position: 'relative' }}>
                  <div
                    className={`formula-display-area ${formulaTokens.length > 0 ? 'active' : ''}`}
                    onDrop={handleDropOnFormula}
                    onDragOver={handleDragOverFormula}
                  >
                    {formulaTokens.length === 0 ? (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        왼쪽 데이터 목록에서 칩을 <strong>끌어다 놓거나</strong>, 위의 연산자를 클릭하여 수식을 작성하세요. 토큰의 ✕ 버튼으로 개별 삭제 가능합니다.
                      </span>
                    ) : (
                      formulaTokens.map((token, i) => {
                        let tokenClass = 'token-field';
                        if (token.type === 'operator') tokenClass = 'token-operator';
                        if (token.type === 'function') tokenClass = 'token-function';
                        if (token.type === 'number') tokenClass = 'token-number';

                        return (
                          <div key={i} className={`formula-token ${tokenClass}`}>
                            <span>{token.label}</span>
                            <button
                              type="button"
                              className="token-remove"
                              onClick={() => removeTokenAt(i)}
                              aria-label={`${token.label} 토큰 삭제`}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {formulaTokens.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }} onClick={deleteLastToken}>
                        <RotateCcw size={13} />
                        한칸 지우기
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }} onClick={clearFormula}>
                        <Trash2 size={13} />
                        전체 지우기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart type & Save */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>시각화 스타일:</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(['bar', 'line', 'scatter', 'pie', 'histogram'] as const).map(type => (
                      <button
                        key={type}
                        className={`btn ${selectedChartType === type ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={() => setSelectedChartType(type)}
                      >
                        {type === 'bar' && '막대형'}
                        {type === 'line' && '선형'}
                        {type === 'scatter' && '산점도'}
                        {type === 'pie' && '파이형'}
                        {type === 'histogram' && '히스토그램'}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleSaveIndicator} style={{ gap: '6px' }}>
                  <Plus size={18} />
                  학습지표 빌드 및 저장
                </button>
              </div>
            </div>

            {/* 3. 지표 한 눈에 보기 */}
            <div className="glass-panel" style={{ padding: embedded ? '14px 16px' : '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: embedded ? 10 : 16 }}>
                <h3 className="builder-section-title">
                  <Eye size={15} style={{ color: 'var(--color-success)' }} />
                  지표 한 눈에 보기
                </h3>
                
                {selectedChartType === 'scatter' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>X축 변수 설정:</span>
                    <select 
                      className="form-select" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      value={scatterXField}
                      onChange={(e) => setScatterXField(e.target.value)}
                    >
                      {XAPI_FIELDS.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formulaTokens.length === 0 ? (
                <div style={{ height: embedded ? '200px' : '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-dim)', background: 'rgba(15,23,42,0.04)', borderRadius: 'var(--radius-md)' }}>
                  <ChartBar size={48} style={{ marginBottom: '12px' }} />
                  <p>수식이 비어 있습니다. 수식을 구성하면 학급 데이터 분석 시뮬레이션이 활성화됩니다.</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: embedded ? '240px' : '320px', background: 'rgba(15,23,42,0.04)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderPreviewChart({
                      type: selectedChartType,
                      data: chartData,
                      scatterXField,
                      indicatorName,
                    })}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 4. 저장된 커스텀 지표 리스트 (embedded 모드에서는 외부에서 렌더링하므로 숨김) */}
            {!embedded && customIndicators.length > 0 && (
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
                  ✓ 이 차시에 빌드된 맞춤형 지표 리스트 ({customIndicators.length}개)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customIndicators.map(ind => (
                    <div 
                      key={ind.id} 
                      className="glass-card" 
                      style={{ 
                        padding: '12px 16px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{ind.name}</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          수식: {ind.formula.map(t => t.label).join(' ')} (시각화: {ind.chartType === 'scatter' ? '산점도' : ind.chartType === 'bar' ? '막대' : '선'})
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleEditIndicator(ind)}>
                          편집/불러오기
                        </button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDeleteIndicator(ind.id)}>
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>차시를 먼저 불러와 주세요.</h3>
        </div>
      )}

    </div>
  );
};
