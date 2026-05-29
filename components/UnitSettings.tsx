'use client';

import React, { useState } from 'react';
import type { Unit, Subunit, Lesson, ActivityTypes } from '@/lib/types';
import { getDefaultUnitsByPublisher } from '@/lib/mockData';
import { 
  BookOpen, Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, Sparkles, AlertCircle,
  ChevronDown, ChevronUp, Compass, Award, Layers, HelpCircle, CheckCircle2, ArrowRight
} from 'lucide-react';

interface Props {
  units: Unit[];
  onChange: (units: Unit[]) => void;
  publisher: string;
  lessons: Lesson[];
  onChangeLessons: (lessons: Lesson[]) => void;
  onSelectLessonForBuilder: (lesson: Lesson) => void;
  onSwitchTab: (tab: 'settings' | 'units' | 'insights' | 'students') => void;
}

// Activity Types options constant
const PARTICIPATION_OPTIONS = ['개인학습', '짝 학습', '모둠 학습', '학급 전체 학습'];
const GOAL_OPTIONS = ['개념 학습', '적용 학습', '문제해결 학습'];
const FORMAT_OPTIONS = ['개념 이해', '퀴즈', '발표', '토의', '토론', '글쓰기', '창작', '탐구'];

export const UnitSettings: React.FC<Props> = ({ 
  units, 
  onChange, 
  publisher,
  lessons,
  onChangeLessons,
  onSelectLessonForBuilder,
  onSwitchTab
}) => {
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitTitle, setEditingUnitTitle] = useState('');
  
  const [editingSubunitId, setEditingSubunitId] = useState<string | null>(null);
  const [editingSubunitTitle, setEditingSubunitTitle] = useState('');
  const [editingSubunitCount, setEditingSubunitCount] = useState(1);
  const [editingSubunitPlan, setEditingSubunitPlan] = useState('');
  const [editingSubunitEval, setEditingSubunitEval] = useState('');

  // Expandable state for lesson configurations inside subunits
  // Key: subunitId, Value: expanded lesson id
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // Handle resetting to default textbook structure
  const handleResetToDefault = () => {
    if (window.confirm(`현재 수정된 단원 구성을 지우고, '${publisher}' 출판사 기본 단원 구성으로 되돌리시겠습니까?`)) {
      onChange(JSON.parse(JSON.stringify(getDefaultUnitsByPublisher(publisher))));
      localStorage.removeItem('alad_curriculum_lessons');
      window.location.reload();
    }
  };

  // Reorder Units
  const moveUnit = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= units.length) return;
    
    const updated = [...units];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    
    updated.forEach((u, i) => {
      u.number = i + 1;
    });
    
    onChange(updated);
  };

  // Reorder Subunits inside a Unit
  const moveSubunit = (unitId: string, subIndex: number, direction: 'up' | 'down') => {
    const updated = units.map(unit => {
      if (unit.id !== unitId) return unit;
      
      const nextIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;
      if (nextIndex < 0 || nextIndex >= unit.subunits.length) return unit;
      
      const updatedSubunits = [...unit.subunits];
      const temp = updatedSubunits[subIndex];
      updatedSubunits[subIndex] = updatedSubunits[nextIndex];
      updatedSubunits[nextIndex] = temp;
      
      return { ...unit, subunits: updatedSubunits };
    });
    
    onChange(updated);
  };

  // Add Unit
  const handleAddUnit = () => {
    const newUnit: Unit = {
      id: `unit_${Date.now()}`,
      number: units.length + 1,
      title: '새로운 대단원',
      achievementStandards: [],
      subunits: []
    };
    onChange([...units, newUnit]);
  };

  // Delete Unit
  const handleDeleteUnit = (unitId: string) => {
    if (!window.confirm('이 대단원과 포함된 모든 소단원이 삭제됩니다. 진행하시겠습니까?')) return;
    const updated = units.filter(u => u.id !== unitId).map((u, i) => ({
      ...u,
      number: i + 1
    }));
    onChange(updated);
  };

  // Edit Unit Title
  const startEditUnit = (unit: Unit) => {
    setEditingUnitId(unit.id);
    setEditingUnitTitle(unit.title);
  };

  const saveEditUnit = (unitId: string) => {
    const updated = units.map(u => {
      if (u.id === unitId) {
        return { ...u, title: editingUnitTitle };
      }
      return u;
    });
    onChange(updated);
    setEditingUnitId(null);
  };

  // Subunit CRUD
  const handleAddSubunit = (unitId: string) => {
    const updated = units.map(u => {
      if (u.id !== unitId) return u;
      const subNum = `(${u.subunits.length + 1})`;
      const newSub: Subunit = {
        id: `sub_${Date.now()}`,
        number: subNum,
        title: '새로운 소단원',
        lessonCount: 2,
        lessonPlan: '기본 차시 수업 계획',
        evaluationPlan: '기본 평가 계획',
        lessons: []
      };
      return { ...u, subunits: [...u.subunits, newSub] };
    });
    onChange(updated);
  };

  const handleDeleteSubunit = (unitId: string, subunitId: string) => {
    if (!window.confirm('이 소단원을 삭제하시겠습니까?')) return;
    const updated = units.map(u => {
      if (u.id !== unitId) return u;
      const filtered = u.subunits.filter(sub => sub.id !== subunitId).map((sub, i) => ({
        ...sub,
        number: `(${i + 1})`
      }));
      return { ...u, subunits: filtered };
    });
    onChange(updated);
  };

  const startEditSubunit = (subunit: Subunit) => {
    setEditingSubunitId(subunit.id);
    setEditingSubunitTitle(subunit.title);
    setEditingSubunitCount(subunit.lessonCount);
    setEditingSubunitPlan(subunit.lessonPlan);
    setEditingSubunitEval(subunit.evaluationPlan);
  };

  const saveEditSubunit = (unitId: string, subunitId: string) => {
    const updated = units.map(u => {
      if (u.id !== unitId) return u;
      const updatedSubs = u.subunits.map(sub => {
        if (sub.id === subunitId) {
          return {
            ...sub,
            title: editingSubunitTitle,
            lessonCount: Number(editingSubunitCount),
            lessonPlan: editingSubunitPlan,
            evaluationPlan: editingSubunitEval
          };
        }
        return sub;
      });
      return { ...u, subunits: updatedSubs };
    });
    onChange(updated);
    setEditingSubunitId(null);
  };

  // Manage Achievement Standards
  const handleAddStandard = (unitId: string) => {
    const code = prompt('새 성취기준 코드 입력 (예: [9국05-07]):');
    if (!code) return;
    const desc = prompt('성취기준 상세 내용 입력:');
    if (!desc) return;

    const updated = units.map(u => {
      if (u.id !== unitId) return u;
      return {
        ...u,
        achievementStandards: [...u.achievementStandards, { code, desc }]
      };
    });
    onChange(updated);
  };

  const handleRemoveStandard = (unitId: string, code: string) => {
    const updated = units.map(u => {
      if (u.id !== unitId) return u;
      return {
        ...u,
        achievementStandards: u.achievementStandards.filter(std => std.code !== code)
      };
    });
    onChange(updated);
  };

  // Lesson modification hooks
  const handleUpdateLesson = (updatedLesson: Lesson) => {
    const updated = lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l);
    onChangeLessons(updated);
  };

  const toggleActivityOption = (
    lesson: Lesson, 
    category: 'participation' | 'goal' | 'format', 
    option: string
  ) => {
    const currentList = lesson.activityTypes[category];
    let newList = [...currentList];

    if (currentList.includes(option)) {
      if (currentList.length > 1) {
        newList = currentList.filter(item => item !== option);
      }
    } else {
      newList.push(option);
    }

    handleUpdateLesson({
      ...lesson,
      activityTypes: {
        ...lesson.activityTypes,
        [category]: newList
      }
    });
  };

  const toggleStandardForLesson = (lesson: Lesson, code: string) => {
    const current = lesson.achievementStandards;
    const updatedStandards = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];

    handleUpdateLesson({
      ...lesson,
      achievementStandards: updatedStandards
    });
  };

  // Recommendations builder
  const getSuggestedIndicators = (activityTypes: ActivityTypes): { name: string; desc: string }[] => {
    const { format } = activityTypes;
    const suggestions: { name: string; desc: string }[] = [];

    if (format.includes('퀴즈')) {
      suggestions.push({
        name: '퀴즈 성취 성장도 및 정답 추세',
        desc: '전 차시 평균 대비 이번 퀴즈 점수의 향상 수준(성장 추이)과 학생들 간 성취 분포를 분석합니다.'
      });
      suggestions.push({
        name: '접속 대비 성적 효율도',
        desc: '총 접속 시간 대비 퀴즈 점수 비율 (퀴즈점수 / 접속시간)로 효율적인 학습 상태를 평가합니다.'
      });
    }

    if (format.includes('토의') || format.includes('토론')) {
      suggestions.push({
        name: '모둠 협동 및 피드백 상호작용',
        desc: '모둠원 댓글 달기 횟수와 댓글 조회 수, 공유 자료 수를 합산하여 협력학습 상호작용 정도를 파악합니다.'
      });
      suggestions.push({
        name: '피드백 수용 적극성',
        desc: '교사/동료 피드백 수신 후 과제물을 수정 보완한 횟수(과제수정횟수 / 피드백조회수)를 연산하여 반영합니다.'
      });
    }

    if (format.includes('글쓰기') || format.includes('창작')) {
      suggestions.push({
        name: '글쓰기 생산성 대비 몰입도',
        desc: '작성한 감상문/에세이 자수 대비 과제 수정 보완 횟수의 밀도 (글쓰기 자수 / 수정 보완 횟수)를 시각화합니다.'
      });
      suggestions.push({
        name: '피드백 열람 속도 및 성찰 성취도',
        desc: '피드백 등록 후 열람 속도와 최종 발표/글쓰기 평가 결과의 상호 연계 분포를 확인합니다.'
      });
    }

    if (format.includes('발표')) {
      suggestions.push({
        name: '발표 성취 및 동료 상호 평가 분산',
        desc: '발표 평가 점수의 분포 및 동료 발표 자료 조회 시간(관심도)과의 상관관계를 플로팅합니다.'
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        name: '기본 학습 참여성 지표',
        desc: '페이지 열람 횟수와 접속 시간을 축으로 삼아 학생들의 성실성을 파악하는 기본 2차원 산점도입니다.'
      });
    }

    return suggestions;
  };

  const handleNavigateToBuilder = (lesson: Lesson) => {
    onSelectLessonForBuilder(lesson);
    onSwitchTab('insights');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="section-header">
        <div>
          <h2>
            <BookOpen size={22} style={{ color: 'var(--color-primary)' }} />
            단원·차시 세팅
          </h2>
          <p>
            선택 출판사 <strong style={{ color: 'var(--color-primary)' }}>{publisher}</strong>의
            단원 구성을 재구성하고, 소단원의 차시별 활동 유형·성취기준을 설정합니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleResetToDefault}>
            출판사 기본값 복원
          </button>
          <button className="btn btn-primary" onClick={handleAddUnit} style={{ gap: 6 }}>
            <Plus size={16} />
            대단원 추가
          </button>
        </div>
      </div>

      {units.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-warning)', margin: '0 auto 16px' }} />
          <h3>선택된 단원 데이터가 없습니다.</h3>
          <p style={{ marginTop: '8px' }}>위의 '출판사 기본값 복원' 버튼을 누르거나 새로운 대단원을 추가하여 시작하세요.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {units.map((unit, unitIdx) => (
            <div key={unit.id} className="glass-panel" style={{ padding: '24px' }}>
              
              {/* 대단원 헤더 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                    대단원 {unit.number}
                  </span>
                  
                  {editingUnitId === unit.id ? (
                    <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '500px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ flex: 1, fontSize: '1.2rem', padding: '4px 8px' }} 
                        value={editingUnitTitle}
                        onChange={(e) => setEditingUnitTitle(e.target.value)}
                      />
                      <button className="btn btn-primary" style={{ padding: '4px 10px' }} onClick={() => saveEditUnit(unit.id)}>
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{unit.title}</h3>
                      <button 
                        onClick={() => startEditUnit(unit)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} disabled={unitIdx === 0} onClick={() => moveUnit(unitIdx, 'up')}>
                    <ArrowUp size={16} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px' }} disabled={unitIdx === units.length - 1} onClick={() => moveUnit(unitIdx, 'down')}>
                    <ArrowDown size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px', gap: '0' }} onClick={() => handleDeleteUnit(unit.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 대단원 세부 Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* 1) 대단원 성취기준 매핑 카드 */}
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.015)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <Sparkles size={15} style={{ color: 'var(--color-info)' }} />
                      연계 성취기준
                    </h4>
                    <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => handleAddStandard(unit.id)}>
                      추가
                    </button>
                  </div>

                  {unit.achievementStandards.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
                      등록된 성취기준이 없습니다.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {unit.achievementStandards.map(std => (
                        <div key={std.code} className="glass-card" style={{ padding: '8px 10px', background: '#ffffff', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '2px' }}>
                            <span>{std.code}</span>
                            <button 
                              onClick={() => handleRemoveStandard(unit.id, std.code)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                            >
                              삭제
                            </button>
                          </div>
                          <div style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>{std.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2) 소단원 및 소단원별 차시 구성 카드 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>소단원 구성</h4>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }} onClick={() => handleAddSubunit(unit.id)}>
                      <Plus size={14} /> 소단원 추가
                    </button>
                  </div>

                  {unit.subunits.length === 0 ? (
                    <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                      소단원을 추가해 주세요.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {unit.subunits.map((subunit, subIdx) => {
                        // Find lessons belonging to this subunit
                        const subunitLessons = lessons.filter(
                          l => l.unitId === unit.id && l.subunitId === subunit.id
                        );

                        return (
                          <div key={subunit.id} className="glass-card" style={{ padding: '20px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)' }}>
                            
                            {editingSubunitId === subunit.id ? (
                              // 소단원 정보 편집 모드
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ flex: 1 }} 
                                    value={editingSubunitTitle}
                                    onChange={(e) => setEditingSubunitTitle(e.target.value)}
                                    placeholder="소단원 명"
                                  />
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>차시수:</label>
                                    <input 
                                      type="number" 
                                      className="form-input" 
                                      style={{ width: '60px', padding: '8px' }} 
                                      value={editingSubunitCount}
                                      onChange={(e) => setEditingSubunitCount(Number(e.target.value))}
                                      min={1}
                                    />
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">수업 계획</label>
                                    <input 
                                      type="text" 
                                      className="form-input" 
                                      value={editingSubunitPlan}
                                      onChange={(e) => setEditingSubunitPlan(e.target.value)}
                                    />
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">평가 계획</label>
                                    <input 
                                      type="text" 
                                      className="form-input" 
                                      value={editingSubunitEval}
                                      onChange={(e) => setEditingSubunitEval(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingSubunitId(null)}>
                                    취소
                                  </button>
                                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => saveEditSubunit(unit.id, subunit.id)}>
                                    저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // 소단원 뷰 모드
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                
                                {/* 소단원 타이틀 라인 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '8px' }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>{subunit.number}</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{subunit.title}</span>
                                    <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                      {subunit.lessonCount}차시 수록
                                    </span>
                                    
                                    {subunit.materials && subunit.materials.map((m, idx) => (
                                      <span key={idx} className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                        {m.title} ({m.type})
                                      </span>
                                    ))}
                                  </div>
                                  
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: '4px', borderRadius: '4px' }} 
                                      disabled={subIdx === 0} 
                                      onClick={() => moveSubunit(unit.id, subIdx, 'up')}
                                    >
                                      <ArrowUp size={14} />
                                    </button>
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: '4px', borderRadius: '4px' }} 
                                      disabled={subIdx === unit.subunits.length - 1} 
                                      onClick={() => moveSubunit(unit.id, subIdx, 'down')}
                                    >
                                      <ArrowDown size={14} />
                                    </button>
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: '4px', borderRadius: '4px', color: 'var(--text-muted)' }} 
                                      onClick={() => startEditSubunit(subunit)}
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      className="btn btn-danger" 
                                      style={{ padding: '4px', borderRadius: '4px', gap: '0' }} 
                                      onClick={() => handleDeleteSubunit(unit.id, subunit.id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* 수업 및 평가계획 한눈에 보기 */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.03)' }}>
                                  <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>수업 계획:</span>
                                    {subunit.lessonPlan || '수업 계획 없음'}
                                  </div>
                                  <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>평가 계획:</span>
                                    {subunit.evaluationPlan || '평가 계획 없음'}
                                  </div>
                                </div>

                                {/* ────────── 차시별 세팅 통합 영역 ────────── */}
                                <div style={{ marginTop: '8px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                                    [차시 설정 및 활동 세팅]
                                  </span>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {subunitLessons.map((lesson) => {
                                      const isExpanded = expandedLessonId === lesson.id;
                                      
                                      return (
                                        <div 
                                          key={lesson.id} 
                                          style={{ 
                                            border: '1px solid rgba(15, 23, 42, 0.06)', 
                                            borderRadius: 'var(--radius-sm)',
                                            background: isExpanded ? '#fafafa' : '#ffffff',
                                            overflow: 'hidden'
                                          }}
                                        >
                                          {/* 차시 요약 헤더 (클릭 시 펼치기) */}
                                          <div 
                                            onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                                            style={{ 
                                              padding: '10px 14px', 
                                              cursor: 'pointer', 
                                              display: 'flex', 
                                              justifyContent: 'space-between', 
                                              alignItems: 'center',
                                              background: isExpanded ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                              transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                              if(!isExpanded) e.currentTarget.style.background = 'rgba(0,0,0,0.015)';
                                            }}
                                            onMouseLeave={(e) => {
                                              if(!isExpanded) e.currentTarget.style.background = 'transparent';
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                              <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                                {lesson.globalIndex}차시
                                              </span>
                                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                {lesson.learningObjective.length > 40 
                                                  ? lesson.learningObjective.substring(0, 40) + '...' 
                                                  : lesson.learningObjective}
                                              </span>
                                              
                                              {/* 활동 유형 태그 표시 */}
                                              <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                                                {lesson.activityTypes.participation.map(p => (
                                                  <span key={p} className="badge" style={{ background: '#f1f5f9', color: 'var(--text-dim)', fontSize: '0.65rem', padding: '1px 5px' }}>{p}</span>
                                                ))}
                                                {lesson.activityTypes.format.map(f => (
                                                  <span key={f} className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{f}</span>
                                                ))}
                                              </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                                                {isExpanded ? '닫기' : '설정 열기'}
                                              </span>
                                              {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-dim)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-dim)' }} />}
                                            </div>
                                          </div>

                                          {/* 펼쳐졌을 때의 차시별 세팅 패널 */}
                                          {isExpanded && (
                                            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(15, 23, 42, 0.05)', display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
                                              
                                              {/* 1. 학습 목표 설정 */}
                                              <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                                  <Compass size={15} style={{ color: 'var(--color-primary)' }} />
                                                  차시별 상세 학습 목표
                                                </label>
                                                <input 
                                                  type="text" 
                                                  className="form-input" 
                                                  value={lesson.learningObjective}
                                                  onChange={(e) => handleUpdateLesson({ ...lesson, learningObjective: e.target.value })}
                                                />
                                              </div>

                                              {/* 2. 성취기준 매핑 */}
                                              <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                                  <Award size={15} style={{ color: 'var(--color-warning)' }} />
                                                  차시 집중 성취기준 연계 (대단원 성취기준 중 선택)
                                                </label>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                                                  {unit.achievementStandards.map(std => {
                                                    const isSelected = lesson.achievementStandards.includes(std.code);
                                                    return (
                                                      <div 
                                                        key={std.code}
                                                        onClick={() => toggleStandardForLesson(lesson, std.code)}
                                                        className="glass-card"
                                                        style={{ 
                                                          padding: '8px 12px', 
                                                          cursor: 'pointer',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          gap: '10px',
                                                          background: isSelected ? 'rgba(245, 158, 11, 0.03)' : '#ffffff',
                                                          borderColor: isSelected ? 'var(--color-warning)' : 'var(--border-color)',
                                                        }}
                                                      >
                                                        <CheckCircle2 size={16} style={{ 
                                                          color: isSelected ? 'var(--color-warning)' : 'var(--text-dim)',
                                                          flexShrink: 0
                                                        }} />
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                          <span style={{ fontWeight: 700, color: isSelected ? 'var(--color-warning)' : 'var(--text-main)', marginRight: '6px' }}>
                                                            {std.code}
                                                          </span>
                                                          <span style={{ color: 'var(--text-muted)' }}>{std.desc}</span>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                  {unit.achievementStandards.length === 0 && (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>연계할 대단원 성취기준이 없습니다. 왼쪽 카드에서 성취기준을 먼저 추가해 주세요.</span>
                                                  )}
                                                </div>
                                              </div>

                                              {/* 3. 활동 유형 조합 설정 */}
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                  <Layers size={15} style={{ color: 'var(--color-primary)' }} />
                                                  활동 유형 조합 세팅 (이 설정에 따라 추천 분석 지표가 달라집니다)
                                                </label>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                                  {/* 참여 양상 */}
                                                  <div className="glass-card" style={{ padding: '10px', background: '#f8fafc' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--color-primary)' }}>
                                                      1) 참여 양상
                                                    </span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                      {PARTICIPATION_OPTIONS.map(opt => {
                                                        const isChecked = lesson.activityTypes.participation.includes(opt);
                                                        return (
                                                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                            <input 
                                                              type="checkbox" 
                                                              checked={isChecked}
                                                              onChange={() => toggleActivityOption(lesson, 'participation', opt)}
                                                              style={{ accentColor: 'var(--color-primary)' }}
                                                            />
                                                            <span style={{ color: isChecked ? 'var(--text-main)' : 'var(--text-dim)' }}>{opt}</span>
                                                          </label>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>

                                                  {/* 활동 목표 */}
                                                  <div className="glass-card" style={{ padding: '10px', background: '#f8fafc' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--color-primary)' }}>
                                                      2) 활동 목표
                                                    </span>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                      {GOAL_OPTIONS.map(opt => {
                                                        const isChecked = lesson.activityTypes.goal.includes(opt);
                                                        return (
                                                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                            <input 
                                                              type="checkbox" 
                                                              checked={isChecked}
                                                              onChange={() => toggleActivityOption(lesson, 'goal', opt)}
                                                              style={{ accentColor: 'var(--color-primary)' }}
                                                            />
                                                            <span style={{ color: isChecked ? 'var(--text-main)' : 'var(--text-dim)' }}>{opt}</span>
                                                          </label>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>

                                                  {/* 활동 형태 */}
                                                  <div className="glass-card" style={{ padding: '10px', background: '#f8fafc' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--color-primary)' }}>
                                                      3) 활동 형태
                                                    </span>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                                      {FORMAT_OPTIONS.map(opt => {
                                                        const isChecked = lesson.activityTypes.format.includes(opt);
                                                        return (
                                                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                            <input 
                                                              type="checkbox" 
                                                              checked={isChecked}
                                                              onChange={() => toggleActivityOption(lesson, 'format', opt)}
                                                              style={{ accentColor: 'var(--color-primary)' }}
                                                            />
                                                            <span style={{ color: isChecked ? 'var(--text-main)' : 'var(--text-dim)' }}>{opt}</span>
                                                          </label>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* 4. 추천 분석 지표 및 빌더 바로가기 (compact) */}
                                              <div
                                                style={{
                                                  display: 'grid',
                                                  gridTemplateColumns: '1fr auto',
                                                  gap: 12,
                                                  background: '#f8fafc',
                                                  border: '1px solid var(--border-color)',
                                                  padding: '10px 14px',
                                                  borderRadius: 'var(--radius-sm)',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <div>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                                                    <HelpCircle size={12} style={{ color: 'var(--color-primary)' }} />
                                                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                      추천 분석 지표
                                                    </span>
                                                  </div>
                                                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    {getSuggestedIndicators(lesson.activityTypes).slice(0, 2).map((ind, i) => (
                                                      <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                        · <strong style={{ color: 'var(--text-main)' }}>{ind.name}</strong>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>

                                                <button
                                                  className="btn btn-primary"
                                                  style={{ padding: '6px 10px', fontSize: '0.72rem', gap: 4 }}
                                                  onClick={() => handleNavigateToBuilder(lesson)}
                                                >
                                                  지표 빌더
                                                  <ArrowRight size={12} />
                                                </button>
                                              </div>

                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
