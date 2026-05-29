'use client';

import React, { useState } from 'react';
import type {
  TeacherProfile,
  ClassRoom,
  ClassSchedule,
  Student,
} from '@/lib/types';
import {
  PUBLISHERS_BY_SUBJECT,
  getDefaultUnitsByPublisher,
  getPreconfiguredLessonsByPublisher,
} from '@/lib/mockData';
import {
  User,
  Mail,
  Save,
  Plus,
  Trash2,
  School,
  Calendar,
  Edit2,
  Users as UsersIcon,
} from 'lucide-react';

interface Props {
  profile: TeacherProfile;
  classes: ClassRoom[];
  onSaveProfile: (p: TeacherProfile) => void;
  onSaveClasses: (cs: ClassRoom[]) => void;
}

const KOREAN_DAYS: Array<'월' | '화' | '수' | '목' | '금'> = ['월', '화', '수', '목', '금'];

export const ProfileView: React.FC<Props> = ({
  profile,
  classes,
  onSaveProfile,
  onSaveClasses,
}) => {
  const [draft, setDraft] = useState<TeacherProfile>(profile);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const handleProfileSave = () => {
    onSaveProfile(draft);
    alert('교사 프로필이 저장되었습니다.');
  };

  // ──── 학급 관리 ────
  const handleAddClass = () => {
    const newClass: ClassRoom = {
      id: `class_${Date.now()}`,
      grade: '3학년',
      classNumber: `${classes.length + 1}반`,
      publisher: PUBLISHERS_BY_SUBJECT[draft.subject]?.[0] ?? '천재교과서(노미숙)',
      students: [],
      schedule: [{ day: '월', period: 1 }],
      units: getDefaultUnitsByPublisher(
        PUBLISHERS_BY_SUBJECT[draft.subject]?.[0] ?? '천재교과서(노미숙)',
      ),
      lessons: getPreconfiguredLessonsByPublisher(
        PUBLISHERS_BY_SUBJECT[draft.subject]?.[0] ?? '천재교과서(노미숙)',
      ),
      currentLessonGlobalIndex: 1,
    };
    onSaveClasses([...classes, newClass]);
    setEditingClassId(newClass.id);
  };

  const handleDeleteClass = (id: string) => {
    if (!window.confirm('이 학급의 모든 데이터(단원/차시 포함)가 삭제됩니다. 계속할까요?')) return;
    onSaveClasses(classes.filter((c) => c.id !== id));
  };

  const handleUpdateClass = (updated: ClassRoom) => {
    onSaveClasses(classes.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 헤더 */}
      <div className="section-header">
        <div>
          <h2>
            <User size={22} style={{ color: 'var(--color-primary)' }} />
            교사 프로필 · 개인정보 수정
          </h2>
          <p>이름·이메일·학교 및 담당 교과 등 기초 정보를 관리하고, 지도 중인 학급을 등록·수정합니다.</p>
        </div>
      </div>

      {/* ──── 개인정보 카드 ──── */}
      <section className="glass-panel" style={{ padding: 22 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
          <User size={16} style={{ color: 'var(--color-primary)' }} /> 기본 정보
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">교사 이름</label>
            <input
              className="form-input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              className="form-input"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">소속 학교</label>
            <input
              className="form-input"
              value={draft.schoolName}
              onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">학교급</label>
            <select
              className="form-select"
              value={draft.schoolLevel}
              onChange={(e) => setDraft({ ...draft, schoolLevel: e.target.value })}
            >
              <option value="초등학교">초등학교</option>
              <option value="중학교">중학교</option>
              <option value="고등학교">고등학교</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">담당 교과</label>
            <select
              className="form-select"
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            >
              {Object.keys(PUBLISHERS_BY_SUBJECT).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">학기</label>
            <input
              className="form-input"
              value={draft.semester}
              onChange={(e) => setDraft({ ...draft, semester: e.target.value })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleProfileSave} style={{ gap: 6 }}>
            <Save size={14} />
            프로필 저장
          </button>
        </div>
      </section>

      {/* ──── 학급 관리 카드 ──── */}
      <section className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
            <School size={16} style={{ color: 'var(--color-info)' }} />
            지도 학급 ({classes.length})
          </h3>
          <button className="btn btn-primary" onClick={handleAddClass} style={{ gap: 6 }}>
            <Plus size={14} />
            학급 추가
          </button>
        </div>

        {classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-dim)' }}>
            등록된 학급이 없습니다. "학급 추가" 버튼을 눌러 새 학급을 등록하세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {classes.map((c) => (
              <ClassEditor
                key={c.id}
                klass={c}
                expanded={editingClassId === c.id}
                onToggle={() => setEditingClassId(editingClassId === c.id ? null : c.id)}
                onChange={handleUpdateClass}
                onDelete={() => handleDeleteClass(c.id)}
                subject={draft.subject}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// ────────────────────────────────────────────────
// 학급 편집 카드
// ────────────────────────────────────────────────
interface ClassEditorProps {
  klass: ClassRoom;
  expanded: boolean;
  onToggle: () => void;
  onChange: (c: ClassRoom) => void;
  onDelete: () => void;
  subject: string;
}

const ClassEditor: React.FC<ClassEditorProps> = ({
  klass,
  expanded,
  onToggle,
  onChange,
  onDelete,
  subject,
}) => {
  const [newStudent, setNewStudent] = useState('');
  const [bulkInput, setBulkInput] = useState('');

  const updateField = <K extends keyof ClassRoom>(key: K, value: ClassRoom[K]) => {
    onChange({ ...klass, [key]: value });
  };

  const toggleDay = (day: ClassSchedule['day']) => {
    const existing = klass.schedule.find((s) => s.day === day);
    let next: ClassSchedule[];
    if (existing) {
      next = klass.schedule.filter((s) => s.day !== day);
    } else {
      next = [...klass.schedule, { day, period: 1 }].sort(
        (a, b) => KOREAN_DAYS.indexOf(a.day) - KOREAN_DAYS.indexOf(b.day),
      );
    }
    updateField('schedule', next);
  };

  const updatePeriod = (day: ClassSchedule['day'], period: number) => {
    updateField(
      'schedule',
      klass.schedule.map((s) => (s.day === day ? { ...s, period } : s)),
    );
  };

  const addStudent = () => {
    if (!newStudent.trim()) return;
    const s: Student = {
      id: `std_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: newStudent.trim(),
    };
    updateField('students', [...klass.students, s]);
    setNewStudent('');
  };

  const removeStudent = (id: string) => {
    updateField('students', klass.students.filter((s) => s.id !== id));
  };

  const bulkAddStudents = () => {
    if (!bulkInput.trim()) return;
    const names = bulkInput
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    const newStudents: Student[] = names.map((name, i) => ({
      id: `std_${Date.now()}_${i}`,
      name,
    }));
    updateField('students', [...klass.students, ...newStudents]);
    setBulkInput('');
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: 16,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: expanded ? 14 : 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge badge-primary">
            {klass.grade} {klass.classNumber}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {subject} · {klass.publisher} · 학생 {klass.students.length}명
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary"
            onClick={onToggle}
            style={{ padding: '5px 10px', fontSize: '0.78rem', gap: 4 }}
          >
            <Edit2 size={12} /> {expanded ? '접기' : '편집'}
          </button>
          <button
            className="btn btn-danger"
            onClick={onDelete}
            style={{ padding: '5px 10px', fontSize: '0.78rem', gap: 4 }}
          >
            <Trash2 size={12} /> 삭제
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">학년</label>
              <select
                className="form-select"
                value={klass.grade}
                onChange={(e) => updateField('grade', e.target.value)}
              >
                {['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">학급</label>
              <input
                className="form-input"
                value={klass.classNumber}
                onChange={(e) => updateField('classNumber', e.target.value)}
                placeholder="예: 1반"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">교과서 출판사</label>
              <select
                className="form-select"
                value={klass.publisher}
                onChange={(e) => updateField('publisher', e.target.value)}
              >
                {(PUBLISHERS_BY_SUBJECT[subject] ?? PUBLISHERS_BY_SUBJECT['국어']).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">진행 중인 차시</label>
              <input
                className="form-input"
                type="number"
                min={1}
                max={klass.lessons.length}
                value={klass.currentLessonGlobalIndex}
                onChange={(e) => updateField('currentLessonGlobalIndex', Number(e.target.value))}
              />
            </div>
          </div>

          {/* 시간표 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} /> 수업 시간표
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {KOREAN_DAYS.map((day) => {
                const slot = klass.schedule.find((s) => s.day === day);
                const checked = !!slot;
                return (
                  <div
                    key={day}
                    onClick={() => toggleDay(day)}
                    className="glass-card"
                    style={{
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      borderColor: checked ? 'var(--color-primary)' : undefined,
                      background: checked ? 'rgba(79, 70, 229, 0.06)' : '#ffffff',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: checked ? 'var(--color-primary)' : 'var(--text-dim)' }}>
                      {day}
                    </span>
                    {checked && (
                      <select
                        value={slot!.period}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updatePeriod(day, Number(e.target.value))}
                        style={{ fontSize: '0.78rem', padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: 4 }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                          <option key={p} value={p}>
                            {p}교시
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 학생 명단 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UsersIcon size={13} /> 학생 명단 ({klass.students.length}명)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="새 학생 이름 입력"
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStudent()}
              />
              <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={addStudent}>
                <Plus size={14} />
              </button>
            </div>
            <details style={{ marginTop: 4 }}>
              <summary style={{ fontSize: '0.78rem', color: 'var(--color-primary)', cursor: 'pointer' }}>
                일괄 등록 (쉼표 또는 줄바꿈으로 구분)
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="예: 홍길동, 심청이, 이몽룡"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
                <button
                  className="btn btn-secondary"
                  style={{ alignSelf: 'flex-end', padding: '5px 10px', fontSize: '0.78rem' }}
                  onClick={bulkAddStudents}
                >
                  일괄 추가
                </button>
              </div>
            </details>

            {klass.students.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                  gap: 6,
                  maxHeight: 200,
                  overflowY: 'auto',
                  padding: 8,
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: 8,
                }}
              >
                {klass.students.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8fafc',
                      padding: '4px 6px',
                      borderRadius: 4,
                      fontSize: '0.78rem',
                    }}
                  >
                    <span>{s.name}</span>
                    <button
                      onClick={() => removeStudent(s.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-dim)',
                      }}
                      aria-label={`${s.name} 삭제`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
