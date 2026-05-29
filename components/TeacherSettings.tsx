'use client';

import React, { useState } from 'react';
import type { TeacherSettings as SettingsType, Student } from '@/lib/types';
import { INITIAL_STUDENTS, PUBLISHERS_BY_SUBJECT } from '@/lib/mockData';
import { Settings, Users, Save, Trash2, Plus, Sparkles } from 'lucide-react';

interface Props {
  initialSettings: SettingsType;
  onSave: (settings: SettingsType) => void;
}

export const TeacherSettings: React.FC<Props> = ({ initialSettings, onSave }) => {
  const [schoolLevel, setSchoolLevel] = useState(initialSettings.schoolLevel || '중학교');
  const [subject, setSubject] = useState(initialSettings.subject || '국어');
  const [semester, setSemester] = useState(initialSettings.semester || '2학기');
  const [grade, setGrade] = useState(initialSettings.grade || '3학년');
  const [classNumber, setClassNumber] = useState(initialSettings.classNumber || '1반');
  const [publisher, setPublisher] = useState(initialSettings.publisher || '천재교과서(노미숙)');
  
  // Students state
  const [students, setStudents] = useState<Student[]>(
    initialSettings.students.length > 0 ? initialSettings.students : INITIAL_STUDENTS
  );
  const [newStudentName, setNewStudentName] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newStudentName.trim()
    };
    setStudents([...students, newStudent]);
    setNewStudentName('');
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    // Split by comma, newline or whitespace
    const names = bulkInput
      .split(/[\n,]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    const newStudents: Student[] = names.map((name, index) => ({
      id: `std_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
      name
    }));

    setStudents([...students, ...newStudents]);
    setBulkInput('');
    setShowBulkInput(false);
  };

  const handleLoadSampleStudents = () => {
    setStudents(INITIAL_STUDENTS);
  };

  const handleSave = () => {
    onSave({
      schoolLevel,
      subject,
      semester,
      grade,
      classNumber,
      publisher,
      students
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="section-header">
        <div>
          <h2>
            <Settings size={22} style={{ color: 'var(--color-primary)' }} />
            교사 기초 설정
          </h2>
          <p>학교·학급·과목·교과서 출판사·학생 명단을 등록합니다. 이후 단계의 단원/차시 구성과 학생 분석의 기초가 됩니다.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ gap: 6 }}>
          <Save size={16} />
          저장 후 다음 단계
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Card: School & Subject Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--color-info)' }} />
            학급 및 교과서 설정
          </h3>
          
          <div className="form-group">
            <label className="form-label">학교급</label>
            <select className="form-select" value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value)}>
              <option value="초등학교">초등학교</option>
              <option value="중학교">중학교</option>
              <option value="고등학교">고등학교</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">학년</label>
              <select className="form-select" value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="1학년">1학년</option>
                <option value="2학년">2학년</option>
                <option value="3학년">3학년</option>
                {schoolLevel === '초등학교' && (
                  <>
                    <option value="4학년">4학년</option>
                    <option value="5학년">5학년</option>
                    <option value="6학년">6학년</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">학급</label>
              <select className="form-select" value={classNumber} onChange={(e) => setClassNumber(e.target.value)}>
                <option value="1반">1반</option>
                <option value="2반">2반</option>
                <option value="3반">3반</option>
                <option value="4반">4반</option>
                <option value="5반">5반</option>
                <option value="6반">6반</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">학기</label>
              <select className="form-select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="1학기">1학기</option>
                <option value="2학기">2학기</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">교과 과목</label>
              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="국어">국어</option>
                <option value="영어">영어</option>
                <option value="수학">수학</option>
                <option value="사회">사회</option>
                <option value="과학">과학</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">교과서 출판사 선택</label>
            <select
              className="form-select"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            >
              {(PUBLISHERS_BY_SUBJECT[subject] ?? PUBLISHERS_BY_SUBJECT['국어']).map((pub) => (
                <option key={pub} value={pub}>
                  {pub}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              * '천재교과서(노미숙)' 선택 시 중학교 3학년 2학기 국어 교과 단원/성취기준이 자동 로드됩니다. '미래엔(신유식)' 선택 시 별도 단원 데이터가 로드됩니다.
            </p>
          </div>
        </div>

        {/* Right Card: Roster Management */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--color-success)' }} />
              학생 명단 관리 ({students.length}명 등록됨)
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={handleLoadSampleStudents}>
                샘플 로드
              </button>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowBulkInput(!showBulkInput)}>
                {showBulkInput ? '개별 등록' : '일괄 등록'}
              </button>
            </div>
          </div>

          {showBulkInput ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">학생 이름 일괄 입력</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="쉼표(,)나 줄바꿈으로 구분하여 학생 이름을 적어주세요.&#10;예시: 홍길동, 심청이, 이몽룡, 성춘향"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowBulkInput(false)}>취소</button>
                <button className="btn btn-primary" onClick={handleBulkAdd}>일괄 추가하기</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="새 학생 이름 입력"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>
                <Plus size={20} />
              </button>
            </form>
          )}

          {/* Student Grid/List */}
          <div style={{ 
            flex: 1, 
            maxHeight: '260px', 
            overflowY: 'auto', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            background: 'rgba(0,0,0,0.1)'
          }}>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                등록된 학생이 없습니다. 학생을 추가해주세요.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px' }}>
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="glass-card" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '6px 8px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{student.name}</span>
                    <button 
                      onClick={() => handleRemoveStudent(student.id)} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--text-dim)',
                        display: 'flex'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
