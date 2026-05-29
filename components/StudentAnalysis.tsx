'use client';

import React, { useState, useMemo } from 'react';
import type { Student, StudentXApiData } from '@/lib/types';
import { XAPI_FIELDS } from '@/lib/mockData';
import { LongitudinalBuilder } from './LongitudinalBuilder';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { 
  Users, Clock, BookOpen, UserCheck, ShieldAlert, Award 
} from 'lucide-react';

interface Props {
  students: Student[];
  studentsData: StudentXApiData[];
}

export const StudentAnalysis: React.FC<Props> = ({ 
  students, 
  studentsData 
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('quiz_score');
  const [chartStyle, setChartStyle] = useState<'line' | 'area'>('line');

  // mock LRS has globalIndex 1~27 (천재교과서 중3 2학기 전 차시)
  const maxGlobalIndex = 27;
  const activeGlobalIndexes = useMemo(() => {
    return Array.from({ length: maxGlobalIndex }, (_, i) => i + 1);
  }, []);

  // Compute Class Average for each lesson
  const classAverages = useMemo(() => {
    const averages: { [globalIdx: number]: { [fieldId: string]: number } } = {};
    
    activeGlobalIndexes.forEach(globalIdx => {
      averages[globalIdx] = {};
      XAPI_FIELDS.forEach(field => {
        let total = 0;
        let count = 0;
        studentsData.forEach(st => {
          const lData = st.lessonsData[globalIdx];
          if (lData && lData[field.id] !== undefined) {
            total += lData[field.id];
            count++;
          }
        });
        averages[globalIdx][field.id] = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
      });
    });

    return averages;
  }, [studentsData, activeGlobalIndexes]);

  // Stagnation Detection Engine
  const stagnationAlerts = useMemo(() => {
    const alerts: { 
      studentId: string; 
      studentName: string; 
      type: '성적하락' | '참여급감' | '소통부족'; 
      reason: string;
      severity: 'high' | 'medium';
    }[] = [];

    studentsData.forEach(st => {
      // 최근 4차시 평가 (전체 27차시 중 마지막 4)
      const lastLessons = [maxGlobalIndex - 3, maxGlobalIndex - 2, maxGlobalIndex - 1, maxGlobalIndex];
      const quizScores = lastLessons.map(idx => st.lessonsData[idx]?.quiz_score ?? 70);
      const sessionTimes = lastLessons.map(idx => st.lessonsData[idx]?.session_duration ?? 1000);
      const comments = lastLessons.map(idx => st.lessonsData[idx]?.comment_writes ?? 5);

      // Rule 1: 성적 하락형 (Quiz scores constantly declining or dropped below 50)
      const isDecliningQuiz = quizScores[3] < quizScores[2] && quizScores[2] < quizScores[1];
      const hasVeryLowQuiz = quizScores[3] < 50;
      if (isDecliningQuiz && quizScores[3] - quizScores[0] < -15) {
        alerts.push({
          studentId: st.studentId,
          studentName: st.studentName,
          type: '성적하락',
          reason: `최근 4차시 동안 퀴즈 점수가 하락세에 있으며, 초기 대비 ${Math.abs(quizScores[3] - quizScores[0])}점 급락했습니다.`,
          severity: 'high'
        });
      } else if (hasVeryLowQuiz) {
        alerts.push({
          studentId: st.studentId,
          studentName: st.studentName,
          type: '성적하락',
          reason: `최근 차시 퀴즈 점수가 ${quizScores[3]}점으로 기초학력 보충 지도 대상(50점 이하)입니다.`,
          severity: 'medium'
        });
      }

      // Rule 2: 참여도 급감형 (Session duration dropped below 30% of class average in last lesson, or constant drop)
      const lastSessionTime = sessionTimes[3];
      const avgSessionTime = classAverages[maxGlobalIndex]?.session_duration || 1000;
      const isEngagementDropping = sessionTimes[3] < sessionTimes[2] && sessionTimes[2] < sessionTimes[1];
      if (lastSessionTime < avgSessionTime * 0.35) {
        alerts.push({
          studentId: st.studentId,
          studentName: st.studentName,
          type: '참여급감',
          reason: `최근 차시 페이지 접속 시간(${Math.round(lastSessionTime / 60)}분)이 학급 평균 대비 현저히 낮습니다.`,
          severity: 'high'
        });
      } else if (isEngagementDropping && sessionTimes[3] - sessionTimes[0] < -800) {
        alerts.push({
          studentId: st.studentId,
          studentName: st.studentName,
          type: '참여급감',
          reason: `최근 4차시 학습 참여 시간이 ${Math.round(Math.abs(sessionTimes[3] - sessionTimes[0]) / 60)}분 가량 급격히 줄어 정체기에 진입했습니다.`,
          severity: 'medium'
        });
      }

      // Rule 3: 소통 방관형 (Comments written in last 3 lessons are zero or very low)
      const lastComments = comments[3];
      if (lastComments === 0 && comments[2] === 0) {
        alerts.push({
          studentId: st.studentId,
          studentName: st.studentName,
          type: '소통부족',
          reason: `최근 토의/모둠 학습에서 동료 의견에 답글 또는 댓글 작성이 연속 0회로 상호작용 참여가 미진합니다.`,
          severity: 'medium'
        });
      }
    });

    return alerts;
  }, [studentsData, classAverages]);

  // Construct chart dataset for the selected metric
  const chartData = useMemo(() => {
    return activeGlobalIndexes.map(globalIdx => {
      const dataPoint: any = {
        lessonName: `${globalIdx}차시`,
        lessonIndex: globalIdx,
        '학급 평균': classAverages[globalIdx]?.[selectedMetric] || 0
      };

      if (selectedStudentId !== 'all') {
        const student = studentsData.find(st => st.studentId === selectedStudentId);
        if (student) {
          dataPoint[student.studentName] = student.lessonsData[globalIdx]?.[selectedMetric] || 0;
        }
      }

      return dataPoint;
    });
  }, [selectedStudentId, selectedMetric, studentsData, classAverages, activeGlobalIndexes]);

  const selectedMetricLabel = useMemo(() => {
    return XAPI_FIELDS.find(f => f.id === selectedMetric)?.label || selectedMetric;
  }, [selectedMetric]);

  const selectedMetricUnit = useMemo(() => {
    return XAPI_FIELDS.find(f => f.id === selectedMetric)?.unit || '';
  }, [selectedMetric]);

  const selectedStudentName = useMemo(() => {
    if (selectedStudentId === 'all') return '학급 전체';
    return students.find(s => s.id === selectedStudentId)?.name || '학생';
  }, [selectedStudentId, students]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 간결한 섹션 헤더 */}
      <div className="section-header">
        <div>
          <h2>
            <Users size={22} style={{ color: 'var(--color-success)' }} />
            학생 종합 분석
          </h2>
          <p>전 차시에 걸친 종단 추세와 정체 구간(Stagnation Point)을 한 화면에서 모니터링합니다.</p>
        </div>
      </div>

      {/* Main Grid: Left Stagnation Alerts, Right Longitudinal Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Stagnation Warnings */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
            <ShieldAlert size={20} />
            학습 정체 위험 학생 경보 ({stagnationAlerts.length}명)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            최근 4차시 xAPI 성취 점수, 접속 시간, 모둠 상호작용 추세를 분석하여 정체가 의심되는 학생 목록입니다. 클릭 시 종단 추세를 확인합니다.
          </p>

          <div style={{ 
            maxHeight: '520px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
          }}>
            {stagnationAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                <UserCheck size={32} style={{ color: 'var(--color-success)', margin: '0 auto 8px' }} />
                현재 학습 정체 징후가 감지된 학생이 없습니다.
              </div>
            ) : (
              stagnationAlerts.map((alert, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedStudentId(alert.studentId)}
                  className="glass-card stagnant-card"
                  style={{ 
                    padding: '12px', 
                    cursor: 'pointer',
                    background: selectedStudentId === alert.studentId ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.05)',
                    borderLeftWidth: '4px',
                    borderLeftColor: alert.severity === 'high' ? 'var(--color-danger)' : 'var(--color-warning)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{alert.studentName}</span>
                    <span className={`badge ${alert.severity === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {alert.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {alert.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Longitudinal Dashboard Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Chart Controls Card */}
          <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">비교 대상 학생</label>
              <select 
                className="form-select" 
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="all">학급 평균 전체</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">분석 지표 선택</label>
              <select 
                className="form-select" 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {XAPI_FIELDS.map(f => (
                  <option key={f.id} value={f.id}>{f.label} ({f.category})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">차트 그리기 형식</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className={`btn ${chartStyle === 'line' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                  onClick={() => setChartStyle('line')}
                >
                  꺾은선
                </button>
                <button 
                  className={`btn ${chartStyle === 'area' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                  onClick={() => setChartStyle('area')}
                >
                  영역형
                </button>
              </div>
            </div>
          </div>

          {/* 기본 지표 종합 추세 (Small Multiples) - 사용자 명세의 "기본 지표" */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} style={{ color: 'var(--color-info)' }} />
              기본 지표 한눈에 보기 (Small Multiples)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              선행문헌 기반 기본 종단 지표 3종을 동시에 비교합니다 — 참여도·성취도·협력적 상호작용. 점선은 학급 평균, 실선은 선택 학생입니다.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { id: 'page_views', label: '참여도(페이지 열람)', color: 'var(--color-primary)' },
                { id: 'quiz_score', label: '성취도(퀴즈 점수)', color: 'var(--color-success)' },
                { id: 'collab_group_interaction', label: '협력적 상호작용', color: 'var(--color-info)' },
              ].map((m) => {
                const miniData = activeGlobalIndexes.map((idx) => {
                  const point: any = {
                    lesson: `${idx}`,
                    '학급 평균': classAverages[idx]?.[m.id] ?? 0,
                  };
                  if (selectedStudentId !== 'all') {
                    const st = studentsData.find((s) => s.studentId === selectedStudentId);
                    if (st) point['선택 학생'] = st.lessonsData[idx]?.[m.id] ?? 0;
                  }
                  return point;
                });
                return (
                  <div
                    key={m.id}
                    className="glass-card"
                    style={{ padding: '10px 12px', cursor: 'pointer' }}
                    onClick={() => setSelectedMetric(m.id)}
                    title="클릭하면 이 지표가 아래 메인 차트에 표시됩니다"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{m.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>27차시</span>
                    </div>
                    <div style={{ width: '100%', height: '90px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={miniData} margin={{ top: 4, right: 4, left: -28, bottom: -8 }}>
                          <XAxis dataKey="lesson" tick={{ fill: 'var(--text-dim)', fontSize: 9 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 9 }} width={28} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }} />
                          <Line type="monotone" dataKey="학급 평균" stroke={m.color} strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                          {selectedStudentId !== 'all' && (
                            <Line type="monotone" dataKey="선택 학생" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Display Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                {selectedStudentName} - {selectedMetricLabel} 종단 추세 분석
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                단위: {selectedMetricUnit}
              </span>
            </h3>

            <div style={{ width: '100%', height: '360px', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="lessonName" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                    <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                    
                    <Line 
                      type="monotone" 
                      dataKey="학급 평균" 
                      stroke="var(--color-primary)" 
                      strokeDasharray="4 4"
                      strokeWidth={2.5} 
                      dot={{ r: 4 }} 
                    />
                    
                    {selectedStudentId !== 'all' && (
                      <Line 
                        type="monotone" 
                        dataKey={students.find(s => s.id === selectedStudentId)?.name || '선택 학생'} 
                        stroke="var(--color-secondary)" 
                        strokeWidth={3} 
                        dot={{ r: 6 }} 
                        activeDot={{ r: 8 }}
                      />
                    )}
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="lessonName" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                    <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="학급 평균" 
                      stroke="var(--color-primary)" 
                      fillOpacity={1} 
                      fill="url(#colorAvg)" 
                      strokeWidth={2}
                    />
                    
                    {selectedStudentId !== 'all' && (
                      <Area 
                        type="monotone" 
                        dataKey={students.find(s => s.id === selectedStudentId)?.name || '선택 학생'} 
                        stroke="var(--color-secondary)" 
                        fillOpacity={1} 
                        fill="url(#colorStd)" 
                        strokeWidth={2.5}
                      />
                    )}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <Clock size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>평균 학습 접속시간</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {Math.round((classAverages[maxGlobalIndex]?.session_duration || 1000) / 60)}분 / 차시
                </h4>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <Award size={20} style={{ color: 'var(--color-success)' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>평균 퀴즈 점수</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {classAverages[maxGlobalIndex]?.quiz_score || 72}점 / 100점
                </h4>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <BookOpen size={20} style={{ color: 'var(--color-info)' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>평균 페이지 열람수</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {classAverages[maxGlobalIndex]?.page_views || 18}회 / 차시
                </h4>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ───── 맞춤형 종단 지표 빌더 ───── */}
      <LongitudinalBuilder
        students={students}
        studentsData={studentsData}
        selectedStudentId={selectedStudentId}
        maxGlobalIndex={maxGlobalIndex}
      />
    </div>
  );
};
