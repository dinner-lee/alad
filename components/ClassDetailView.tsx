'use client';

import React, { useState, useMemo } from 'react';
import type {
  ClassRoom,
  TeacherProfile,
  Lesson,
  Unit,
  ActivityTypes,
  StudentXApiData,
  CustomIndicator,
  FormulaToken,
} from '@/lib/types';
import {
  generateLrsForStudents,
  formatSchedule,
  getTodaysLessonForClass,
  XAPI_FIELDS,
  formatLessonLabel,
  getExpectedCompletedLessons,
} from '@/lib/mockData';
import { IndicatorBuilder } from './IndicatorBuilder';
import { StudentAnalysis } from './StudentAnalysis';
import { UnitSettings } from './UnitSettings';
import { Modal } from './Modal';
import {
  Edit2,
  Eye,
  Users,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Activity,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  Award,
  Flag,
  Plus,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  Legend,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// 저장된 맞춤 지표 인라인 차트 렌더 (5가지 시각화 분기)
function renderCustomChart(
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | string,
  rows: { name: string; value: number }[],
  classAvg: number,
): React.ReactElement {
  const tick9 = { fill: 'var(--text-dim)', fontSize: 9 } as const;
  const tick10 = { fill: 'var(--text-dim)', fontSize: 10 } as const;
  const tooltipStyle = {
    background: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    fontSize: '0.78rem',
  } as const;

  const classAvgLabel = {
    position: 'insideTopRight' as const,
    value: `학급 평균 ${classAvg}`,
    fill: 'var(--color-secondary)',
    fontSize: 11,
    fontWeight: 600,
  };

  if (type === 'line') {
    return (
      <LineChart data={rows} margin={{ top: 18, right: 8, left: -20, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
        <XAxis dataKey="name" tick={tick9} angle={-40} textAnchor="end" interval={0} height={50} />
        <YAxis tick={tick10} />
        <Tooltip contentStyle={tooltipStyle} />
        <ReferenceLine y={classAvg} stroke="var(--color-secondary)" strokeDasharray="4 4" label={classAvgLabel} />
        <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    );
  }
  if (type === 'scatter') {
    return (
      <ScatterChart margin={{ top: 18, right: 8, left: -20, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
        <XAxis dataKey="name" tick={tick9} angle={-40} textAnchor="end" interval={0} height={50} />
        <YAxis dataKey="value" tick={tick10} />
        <Tooltip contentStyle={tooltipStyle} />
        <ReferenceLine y={classAvg} stroke="var(--color-secondary)" strokeDasharray="4 4" label={classAvgLabel} />
        <Scatter data={rows} fill="var(--color-primary)" />
      </ScatterChart>
    );
  }
  if (type === 'pie') {
    const vals = rows.map((r) => r.value).sort((a, b) => a - b);
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
    rows.forEach((r) => {
      if (r.value >= q3) buckets[0].value++;
      else if (r.value >= q2) buckets[1].value++;
      else if (r.value >= q1) buckets[2].value++;
      else buckets[3].value++;
    });
    return (
      <PieChart>
        <Pie data={buckets} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="68%" label={(e: any) => e.value}>
          {buckets.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [`${v}명`, n]} />
        <Legend wrapperStyle={{ fontSize: 10 }} />
      </PieChart>
    );
  }
  if (type === 'histogram') {
    const vals = rows.map((r) => r.value);
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
      <BarChart data={bins} margin={{ top: 8, right: 8, left: -20, bottom: 28 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
        <XAxis dataKey="range" tick={tick9} angle={-30} textAnchor="end" interval={0} height={48} />
        <YAxis tick={tick10} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}명`, '학생수']} />
        <Bar dataKey="학생수" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
      </BarChart>
    );
  }
  // default: bar
  return (
    <BarChart data={rows} margin={{ top: 18, right: 8, left: -20, bottom: 28 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
      <XAxis dataKey="name" tick={tick9} angle={-40} textAnchor="end" interval={0} height={50} />
      <YAxis tick={tick10} />
      <Tooltip contentStyle={tooltipStyle} />
      <ReferenceLine
        y={classAvg}
        stroke="var(--color-secondary)"
        strokeDasharray="4 4"
        label={classAvgLabel}
      />
      <Bar dataKey="value" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
    </BarChart>
  );
}

// ────────────────────────────────────────────────
// 차시 활동 유형 조합 기반 기본 지표 (1~2개) 선정
// ────────────────────────────────────────────────
interface DefaultIndicator {
  fieldId: string;
  label: string;
  unit: string;
  insight: string;
}

function getDefaultLessonIndicators(activityTypes: ActivityTypes): DefaultIndicator[] {
  const { format } = activityTypes;
  const result: DefaultIndicator[] = [];

  if (format.includes('퀴즈')) {
    result.push({
      fieldId: 'quiz_score',
      label: '학생별 퀴즈 점수 분포',
      unit: '점',
      insight: '학급 평균 대비 상·하위 분포를 확인하여 보충/심화 대상을 파악합니다.',
    });
  }
  if (format.includes('토의') || format.includes('토론')) {
    result.push({
      fieldId: 'comment_writes',
      label: '의견·댓글 작성 횟수',
      unit: '회',
      insight: '학생 간 의견 표출 빈도로 온라인 토의 참여도를 가늠합니다.',
    });
  }
  if (format.includes('글쓰기') || format.includes('창작')) {
    result.push({
      fieldId: 'writing_score',
      label: '글쓰기 본문 자수',
      unit: '자',
      insight: '학생별 글쓰기 분량 분포로 과제 몰입도를 비교합니다.',
    });
  }
  if (format.includes('발표')) {
    result.push({
      fieldId: 'presentation_grade',
      label: '발표 평가 점수',
      unit: '점',
      insight: '발표 수행 점수의 학급 내 분포를 파악합니다.',
    });
  }
  if (format.includes('탐구')) {
    result.push({
      fieldId: 'shared_materials',
      label: '모둠 공유 자료 수',
      unit: '개',
      insight: '탐구 활동 중 학생이 공유한 자료 수로 적극성을 가늠합니다.',
    });
  }
  if (format.includes('개념 이해') && result.length === 0) {
    result.push({
      fieldId: 'page_views',
      label: '학습 페이지 열람 횟수',
      unit: '회',
      insight: '개념 학습 자료 페이지의 열람 빈도 분포.',
    });
  }

  if (result.length === 0) {
    result.push({
      fieldId: 'page_views',
      label: '페이지 열람 횟수',
      unit: '회',
      insight: '학생별 학습 참여 페이지 열람량.',
    });
    result.push({
      fieldId: 'session_duration',
      label: '접속 시간(초)',
      unit: '초',
      insight: '학생별 학습 집중 시간 분포.',
    });
  }

  return result.slice(0, 2);
}

interface Props {
  profile: TeacherProfile;
  klass: ClassRoom;
  onChange: (c: ClassRoom) => void;
}

type AnalysisTab = 'class' | 'student';

export const ClassDetailView: React.FC<Props> = ({ profile, klass, onChange }) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>('class');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // 학급 학생 명단에 맞춘 LRS 시뮬레이션 데이터 (메모이즈)
  const lrsData = useMemo(() => generateLrsForStudents(klass.students), [klass.students]);

  const today = useMemo(() => getTodaysLessonForClass(klass), [klass]);

  // 학급 종합 분석용 핵심 메트릭 계산
  const classOverview = useMemo(() => {
    const totalLessons = klass.lessons.length;
    const currentLessonIdx = klass.currentLessonGlobalIndex;
    const completed = Math.min(currentLessonIdx - 1, totalLessons);
    const progressPct = Math.round((completed / totalLessons) * 100);

    // 최근 4차시 기준 정체 학생
    const last4 = [
      currentLessonIdx - 3,
      currentLessonIdx - 2,
      currentLessonIdx - 1,
      currentLessonIdx,
    ].filter((i) => i >= 1);
    const stagnant: string[] = [];
    lrsData.forEach((st) => {
      const quizScores = last4.map((i) => st.lessonsData[i]?.quiz_score ?? 70);
      const sessionDur = last4.map((i) => st.lessonsData[i]?.session_duration ?? 1000);
      const declining =
        quizScores.length >= 3 &&
        quizScores[quizScores.length - 1] < quizScores[quizScores.length - 2] &&
        quizScores[quizScores.length - 2] < quizScores[quizScores.length - 3];
      const veryLow = quizScores[quizScores.length - 1] < 50;
      const lowEngage = sessionDur[sessionDur.length - 1] < 400;
      if (declining || veryLow || lowEngage) stagnant.push(st.studentName);
    });

    // 학급 평균 추이 (최대 currentLessonIdx까지)
    const lastShown = Math.min(currentLessonIdx, 27);
    const trendData = Array.from({ length: lastShown }, (_, i) => i + 1).map((idx) => {
      let qSum = 0;
      let pSum = 0;
      let cSum = 0;
      let n = 0;
      lrsData.forEach((st) => {
        const d = st.lessonsData[idx];
        if (d) {
          qSum += d.quiz_score ?? 0;
          pSum += d.page_views ?? 0;
          cSum += d.collab_group_interaction ?? 0;
          n++;
        }
      });
      return {
        lesson: `${idx}`,
        '퀴즈 점수': n ? Math.round((qSum / n) * 10) / 10 : 0,
        '페이지 열람': n ? Math.round((pSum / n) * 10) / 10 : 0,
        '협력적 상호작용': n ? Math.round((cSum / n) * 10) / 10 : 0,
      };
    });

    // 예상 진도(학기 일정 기반)
    const expectedCompleted = getExpectedCompletedLessons(totalLessons, profile.semester);
    const expectedPct = Math.round((expectedCompleted / totalLessons) * 100);
    const paceDiff = completed - expectedCompleted; // 양수: 앞섬, 음수: 뒤처짐

    return {
      progressPct,
      completed,
      totalLessons,
      stagnant,
      trendData,
      expectedCompleted,
      expectedPct,
      paceDiff,
    };
  }, [klass, lrsData, profile.semester]);

  const handleLessonUpdate = (updatedLesson: Lesson) => {
    const newLessons = klass.lessons.map((l) =>
      l.id === updatedLesson.id ? updatedLesson : l,
    );
    onChange({ ...klass, lessons: newLessons });
  };

  if (mode === 'edit') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="section-header">
          <div>
            <h2>
              <Edit2 size={20} style={{ color: 'var(--color-primary)' }} />
              단원/차시 수정 모드 · {klass.grade} {klass.classNumber}
            </h2>
            <p>단원 재구성, 차시별 학습 목표/성취기준/활동 유형을 편집합니다.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setMode('view')} style={{ gap: 6 }}>
            <Eye size={14} />
            보기 모드로 돌아가기
          </button>
        </div>
        <UnitSettings
          units={klass.units}
          publisher={klass.publisher}
          onChange={(newUnits) => onChange({ ...klass, units: newUnits })}
          lessons={klass.lessons}
          onChangeLessons={(newLessons) => onChange({ ...klass, lessons: newLessons })}
          onSelectLessonForBuilder={() => {}}
          onSwitchTab={() => setMode('view')}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ───── 학급 헤더 ───── */}
      <div className="section-header">
        <div>
          <h2>
            <BookOpen size={22} style={{ color: 'var(--color-primary)' }} />
            {klass.grade} {klass.classNumber}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={13} /> 학생 {klass.students.length}명
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> {formatSchedule(klass.schedule)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={13} /> {profile.subject} · {klass.publisher}
            </span>
          </div>
        </div>
      </div>

      {/* ───── 학급/학생 종합 분석 탭 ───── */}
      <div className="glass-panel" style={{ padding: 0 }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 8px',
          }}
        >
          <button
            onClick={() => setAnalysisTab('class')}
            className="btn"
            style={{
              padding: '14px 18px',
              borderRadius: 0,
              borderBottom: analysisTab === 'class' ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'transparent',
              color: analysisTab === 'class' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: analysisTab === 'class' ? 700 : 500,
              gap: 6,
            }}
          >
            <TrendingUp size={15} /> 학급 종합 분석
          </button>
          <button
            onClick={() => setAnalysisTab('student')}
            className="btn"
            style={{
              padding: '14px 18px',
              borderRadius: 0,
              borderBottom: analysisTab === 'student' ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'transparent',
              color: analysisTab === 'student' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: analysisTab === 'student' ? 700 : 500,
              gap: 6,
            }}
          >
            <Users size={15} /> 학생 종합 분석
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {analysisTab === 'class' ? (
            <ClassOverview
              progressPct={classOverview.progressPct}
              completed={classOverview.completed}
              totalLessons={classOverview.totalLessons}
              stagnant={classOverview.stagnant}
              trendData={classOverview.trendData}
              today={today}
              todayLessonLabel={
                today.upcomingLesson
                  ? formatLessonLabel(today.upcomingLesson, klass.units, klass.lessons)
                  : null
              }
              expectedCompleted={classOverview.expectedCompleted}
              expectedPct={classOverview.expectedPct}
              paceDiff={classOverview.paceDiff}
            />
          ) : (
            <StudentAnalysis students={klass.students} studentsData={lrsData} />
          )}
        </div>
      </div>

      {/* ───── 단원·차시 정보 (학급 종합 분석 탭에서만 표시) ───── */}
      {analysisTab === 'class' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
            단원·차시 정보
          </h3>
          <button
            className="btn btn-primary"
            onClick={() => setMode('edit')}
            style={{ gap: 6, padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <Edit2 size={13} /> 단원/차시 수정
          </button>
        </div>

        {klass.units.map((unit) => (
          <UnitBlock
            key={unit.id}
            unit={unit}
            lessons={klass.lessons}
            students={klass.students}
            lrsData={lrsData}
            expandedLessonId={expandedLessonId}
            onToggleLesson={(id) =>
              setExpandedLessonId(expandedLessonId === id ? null : id)
            }
            onUpdateLesson={handleLessonUpdate}
            currentLessonGlobalIndex={klass.currentLessonGlobalIndex}
          />
        ))}
      </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// 학급 종합 분석 (간단 요약)
// ────────────────────────────────────────────────
interface ClassOverviewProps {
  progressPct: number;
  completed: number;
  totalLessons: number;
  stagnant: string[];
  trendData: any[];
  today: { hasClassToday: boolean; period?: number; upcomingLesson?: Lesson };
  todayLessonLabel: string | null;
  expectedCompleted: number;
  expectedPct: number;
  paceDiff: number;
}

const ClassOverview: React.FC<ClassOverviewProps> = ({
  progressPct,
  completed,
  totalLessons,
  stagnant,
  trendData,
  today,
  todayLessonLabel,
  expectedCompleted,
  expectedPct,
  paceDiff,
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'stretch' }}>
    {/* 좌측: KPI + 알림 */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(6,182,212,0.04))',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          이번 학기 진도
        </span>
        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          {progressPct}%
        </span>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          전체 {totalLessons}차시 중 {completed}차시 완료
        </div>
        {/* 진도 바: 회색 = 학사 일정상 예상 진도, 보라 = 실제 진도 */}
        <div
          style={{
            background: 'rgba(15,23,42,0.05)',
            borderRadius: 999,
            height: 8,
            marginTop: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
          title={`예상 ${expectedPct}% (${expectedCompleted}차시) · 실제 ${progressPct}% (${completed}차시)`}
        >
          {/* 예상 진도 (옅은 회색) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${expectedPct}%`,
              height: '100%',
              background: 'rgba(100, 116, 139, 0.35)',
              transition: 'width 0.4s',
            }}
          />
          {/* 실제 진도 (보라) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${progressPct}%`,
              height: '100%',
              background: 'var(--color-primary)',
              transition: 'width 0.4s',
            }}
          />
          {/* 예상 진도 마커 (회색 세로선) */}
          <div
            style={{
              position: 'absolute',
              left: `${expectedPct}%`,
              top: -2,
              bottom: -2,
              width: 2,
              background: '#475569',
              transform: 'translateX(-1px)',
            }}
          />
        </div>
        {/* 예상 진도 vs 실제 격차 안내 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: 2,
                background: 'rgba(100, 116, 139, 0.55)',
              }}
            />
            예상 {expectedCompleted}차시
          </span>
          <span
            style={{
              fontWeight: 700,
              color:
                paceDiff > 0
                  ? 'var(--color-success)'
                  : paceDiff < 0
                    ? 'var(--color-warning)'
                    : 'var(--text-muted)',
            }}
          >
            {paceDiff > 0
              ? `▲ ${paceDiff}차시 앞섬`
              : paceDiff < 0
                ? `▼ ${Math.abs(paceDiff)}차시 뒤처짐`
                : '예상과 동일'}
          </span>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          {today.hasClassToday ? `오늘 ${today.period}교시` : '오늘 수업 없음'}
        </span>
        <div style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
          {today.upcomingLesson && todayLessonLabel
            ? `${todayLessonLabel} · ${today.upcomingLesson.learningObjective.slice(0, 50)}…`
            : '전 차시 진행 완료'}
        </div>
      </div>

      <div
        style={{
          background: stagnant.length > 0 ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.05)',
          border: `1px solid ${stagnant.length > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: stagnant.length > 0 ? 'var(--color-danger)' : 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ShieldAlert size={12} />
          학습 정체 위험 ({stagnant.length}명)
        </span>
        {stagnant.length > 0 ? (
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {stagnant.map((n) => (
              <span key={n} className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                {n}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            정체 징후가 감지된 학생이 없습니다.
          </div>
        )}
      </div>
    </div>

    {/* 우측: 기본 지표 추세 (좌측 KPI 컬럼과 동일 높이로 stretch) */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={16} style={{ color: 'var(--color-primary)' }} />
        학급 기본 지표 추세
      </h4>
      <div style={{ width: '100%', flex: 1, minHeight: 280, background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 8, right: 18, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
            <XAxis dataKey="lesson" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.78rem' }} />
            <Legend
              verticalAlign="top"
              align="right"
              height={26}
              iconType="plainline"
              iconSize={16}
              wrapperStyle={{ fontSize: 11, paddingBottom: 2 }}
            />
            <Line type="monotone" dataKey="퀴즈 점수" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="페이지 열람" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="협력적 상호작용" stroke="var(--color-info)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────
// 단원 블록
// ────────────────────────────────────────────────
interface UnitBlockProps {
  unit: Unit;
  lessons: Lesson[];
  students: any[];
  lrsData: any[];
  expandedLessonId: string | null;
  onToggleLesson: (id: string) => void;
  onUpdateLesson: (l: Lesson) => void;
  currentLessonGlobalIndex: number;
}

const UnitBlock: React.FC<UnitBlockProps> = ({
  unit,
  lessons,
  expandedLessonId,
  onToggleLesson,
  onUpdateLesson,
  lrsData,
  currentLessonGlobalIndex,
  students,
}) => {
  const [unitExpanded, setUnitExpanded] = useState(false);
  const unitLessons = lessons.filter((l) => l.unitId === unit.id);
  const unitLessonsOrdered = [...unitLessons].sort((a, b) => a.globalIndex - b.globalIndex);
  // 차시 번호: 단원 내 1차시부터 재시작 (lessonId → 단원 내 순번 매핑)
  const localLessonNumber = (id: string): number =>
    unitLessonsOrdered.findIndex((l) => l.id === id) + 1;
  const completedInUnit = unitLessons.filter(
    (l) => l.globalIndex < currentLessonGlobalIndex,
  ).length;

  return (
    <div className="glass-panel" style={{ padding: 18 }}>
      {/* 단원 헤더 (클릭 가능) */}
      <button
        onClick={() => setUnitExpanded(!unitExpanded)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
        }}
        aria-expanded={unitExpanded}
      >
        <span className="badge badge-primary">대단원 {unit.number}</span>
        <h4
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: unitExpanded ? 'var(--color-primary)' : 'var(--text-main)',
          }}
        >
          {unit.title}
        </h4>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          · {unit.subunits.length}개 소단원 · {unitLessons.length}차시 · 진도{' '}
          {completedInUnit}/{unitLessons.length}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', fontSize: '0.78rem' }}>
          {unitExpanded ? '단원 개요 닫기' : '단원 개요 열기'}
          {unitExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {/* 단원 개요 패널 (성취기준 + 대표 지표 추이) */}
      {unitExpanded && (
        <UnitOverviewPanel
          unit={unit}
          unitLessons={unitLessons}
          lrsData={lrsData}
          currentLessonGlobalIndex={currentLessonGlobalIndex}
        />
      )}

      {/* 소단원 + 차시 리스트 */}
      <div style={{ marginTop: 12 }}>
        {unit.subunits.map((sub) => {
          const subLessons = unitLessons.filter((l) => l.subunitId === sub.id);
          return (
            <div
              key={sub.id}
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: 10,
                marginTop: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{sub.number}</span>
                <span style={{ fontWeight: 600 }}>{sub.title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subLessons.map((lesson) => {
                  const expanded = expandedLessonId === lesson.id;
                  const isCurrent = lesson.globalIndex === currentLessonGlobalIndex;
                  return (
                    <div
                      key={lesson.id}
                      style={{
                        border: `1px solid ${expanded ? 'var(--color-primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: expanded ? '#fafbff' : '#ffffff',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        onClick={() => onToggleLesson(lesson.id)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                          <span
                            className="badge"
                            style={{
                              background: isCurrent ? 'rgba(79,70,229,0.12)' : 'rgba(15,23,42,0.05)',
                              color: isCurrent ? 'var(--color-primary)' : 'var(--text-muted)',
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                            }}
                          >
                            {localLessonNumber(lesson.id)}차시
                            {isCurrent && ' · 진행중'}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {lesson.learningObjective.length > 60
                              ? lesson.learningObjective.slice(0, 60) + '…'
                              : lesson.learningObjective}
                          </span>
                          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                            {lesson.activityTypes.format.slice(0, 2).map((f) => (
                              <span
                                key={f}
                                className="badge badge-info"
                                style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                              >
                                {f}
                              </span>
                            ))}
                            {lesson.customIndicators.length > 0 && (
                              <span
                                className="badge badge-success"
                                style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                              >
                                지표 {lesson.customIndicators.length}
                              </span>
                            )}
                          </div>
                        </div>
                        {expanded ? (
                          <ChevronDown size={16} style={{ color: 'var(--text-dim)' }} />
                        ) : (
                          <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
                        )}
                      </div>

                      {expanded && (
                        <div style={{ padding: 16, borderTop: '1px solid var(--border-color)' }}>
                          <LessonOverviewPanel
                            lesson={lesson}
                            studentsCount={students.length}
                            lrsData={lrsData}
                            onUpdateLesson={onUpdateLesson}
                            unitNumber={unit.number}
                            localLessonNumber={localLessonNumber(lesson.id)}
                            isConducted={lesson.globalIndex <= currentLessonGlobalIndex}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// 단원 개요 패널 (성취기준 + 대표 지표 추이)
// ────────────────────────────────────────────────
interface UnitOverviewPanelProps {
  unit: Unit;
  unitLessons: Lesson[];
  lrsData: StudentXApiData[];
  currentLessonGlobalIndex: number;
}

const UnitOverviewPanel: React.FC<UnitOverviewPanelProps> = ({
  unit,
  unitLessons,
  lrsData,
  currentLessonGlobalIndex,
}) => {
  const unitTrend = useMemo(() => {
    const ordered = [...unitLessons].sort((a, b) => a.globalIndex - b.globalIndex);
    return ordered.map((l, i) => {
      let q = 0;
      let p = 0;
      let c = 0;
      let n = 0;
      lrsData.forEach((st) => {
        const d = st.lessonsData[l.globalIndex];
        if (d) {
          q += d.quiz_score ?? 0;
          p += d.page_views ?? 0;
          c += d.collab_group_interaction ?? 0;
          n++;
        }
      });
      return {
        lesson: `${i + 1}차시`,
        '퀴즈 점수': n ? Math.round((q / n) * 10) / 10 : 0,
        '페이지 열람': n ? Math.round((p / n) * 10) / 10 : 0,
        '협력적 상호작용': n ? Math.round((c / n) * 10) / 10 : 0,
      };
    });
  }, [unitLessons, lrsData]);

  const completed = unitLessons.filter((l) => l.globalIndex < currentLessonGlobalIndex).length;

  return (
    <div
      style={{
        marginTop: 14,
        padding: 16,
        background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(6,182,212,0.03))',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 18,
      }}
    >
      {/* 좌: 성취기준 + 진도 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.02em' }}>
            단원 진도
          </span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {completed} / {unitLessons.length}차시
          </div>
        </div>

        <div>
          <h5
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 8,
            }}
          >
            <Award size={14} style={{ color: 'var(--color-warning)' }} />
            대단원 성취기준 ({unit.achievementStandards.length})
          </h5>
          {unit.achievementStandards.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              등록된 성취기준이 없습니다.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {unit.achievementStandards.map((std) => (
                <div
                  key={std.code}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '7px 10px',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {std.code}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.35 }}>
                    {std.desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 우: 대표 지표 추이 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h5
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
          단원 내 학생 학습 대표 지표 추이 (학급 평균)
        </h5>
        <div
          style={{
            width: '100%',
            height: 220,
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={unitTrend} margin={{ top: 6, right: 18, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
              <XAxis dataKey="lesson" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="퀴즈 점수" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="페이지 열람" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="협력적 상호작용" stroke="var(--color-info)" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// 차시 정보 + 기본 지표 시각화 패널
// ────────────────────────────────────────────────
interface LessonOverviewPanelProps {
  lesson: Lesson;
  studentsCount: number;
  lrsData: StudentXApiData[];
  onUpdateLesson: (l: Lesson) => void;
  unitNumber: number;
  localLessonNumber: number;
  isConducted: boolean;
}

const LessonOverviewPanel: React.FC<LessonOverviewPanelProps> = ({
  lesson,
  studentsCount,
  lrsData,
  onUpdateLesson,
  unitNumber,
  localLessonNumber,
  isConducted,
}) => {
  const [showBuilder, setShowBuilder] = useState(false);

  const defaultIndicators = useMemo(
    () => getDefaultLessonIndicators(lesson.activityTypes),
    [lesson.activityTypes],
  );

  // 실제 참여 학생 수 (해당 차시에 데이터가 있는 학생 수)
  const participants = useMemo(
    () => lrsData.filter((st) => st.lessonsData[lesson.globalIndex]).length,
    [lrsData, lesson.globalIndex],
  );

  const customIndicators = lesson.customIndicators ?? [];
  const totalCharts = defaultIndicators.length + customIndicators.length;
  const cols = totalCharts >= 2 ? 2 : 1;

  const handleDeleteCustom = (indId: string) => {
    if (!window.confirm('이 차시 인사이트(맞춤 지표)를 삭제할까요?')) return;
    onUpdateLesson({
      ...lesson,
      customIndicators: customIndicators.filter((i) => i.id !== indId),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── 학습 목표 + 참여 학생 (라벨은 박스 밖, 차시 인사이트와 동일 스타일) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isConducted ? '1fr 220px' : '1fr',
          gap: 16,
        }}
      >
        {/* 좌측: 학습 목표 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <Flag size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>학습 목표</span>
            {!isConducted && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 999,
                  padding: '1px 8px',
                }}
              >
                미진행
              </span>
            )}
            {lesson.achievementStandards.map((s) => (
              <span key={s} className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                {s}
              </span>
            ))}
          </div>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <p style={{ fontSize: '0.88rem', lineHeight: 1.4, color: 'var(--text-main)', fontWeight: 500 }}>
              {lesson.learningObjective}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              <span>
                <strong style={{ color: 'var(--text-main)' }}>참여 양상:</strong>{' '}
                {lesson.activityTypes.participation.join(', ')}
              </span>
              <span>
                <strong style={{ color: 'var(--text-main)' }}>활동 목표:</strong>{' '}
                {lesson.activityTypes.goal.join(', ')}
              </span>
              <span>
                <strong style={{ color: 'var(--text-main)' }}>활동 형태:</strong>{' '}
                {lesson.activityTypes.format.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 참여 학생 */}
        {isConducted && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Users size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>참여 학생</span>
            </div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
                display: 'flex',
                alignItems: 'baseline',
                gap: 6,
                height: 'calc(100% - 26px)',
                minHeight: 80,
              }}
            >
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                {participants}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                / {studentsCount}명
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── 차시 인사이트 (미진행 차시는 안내 문구로 대체) ── */}
      {isConducted ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Activity size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>차시 인사이트</span>
            <button
              className="add-indicator-btn"
              onClick={() => setShowBuilder(true)}
              style={{ marginLeft: 'auto' }}
              aria-label="맞춤 지표 추가"
              title="맞춤 지표 추가 (지표 빌더 열기)"
            >
              <Plus size={13} />
              맞춤 지표 추가
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: cols === 2 ? '1fr 1fr' : '1fr',
              gap: 12,
            }}
          >
            {defaultIndicators.map((ind) => (
              <DefaultIndicatorChart
                key={ind.fieldId}
                indicator={ind}
                lesson={lesson}
                lrsData={lrsData}
              />
            ))}
            {customIndicators.map((ci) => (
              <CustomIndicatorChart
                key={ci.id}
                indicator={ci}
                lesson={lesson}
                lrsData={lrsData}
                onDelete={() => handleDeleteCustom(ci.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 16px',
            background: 'rgba(15, 23, 42, 0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          <Activity size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          <span>
            아직 진행되지 않은 차시입니다. 차시가 진행되면 학생 xAPI 로그를 기반으로 한 차시 인사이트가 자동으로 표시됩니다.
          </span>
        </div>
      )}

      {/* 지표 빌더 모달 (Portal로 document.body에 렌더) */}
      <Modal
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        title={
          <>
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
            지표 빌더 · {unitNumber}단원 {localLessonNumber}차시
          </>
        }
      >
        <IndicatorBuilder
          selectedLesson={lesson}
          lessons={[lesson]}
          onUpdateLesson={onUpdateLesson}
          studentsData={lrsData}
          embedded
          onAfterSave={() => setShowBuilder(false)}
        />
      </Modal>
    </div>
  );
};

// 기본 지표 1개에 대한 학생별 막대 차트
interface DefaultIndicatorChartProps {
  indicator: DefaultIndicator;
  lesson: Lesson;
  lrsData: StudentXApiData[];
}

const DefaultIndicatorChart: React.FC<DefaultIndicatorChartProps> = ({
  indicator,
  lesson,
  lrsData,
}) => {
  const { values, classAvg, max, min } = useMemo(() => {
    const rows = lrsData.map((st) => ({
      name: st.studentName,
      value: st.lessonsData[lesson.globalIndex]?.[indicator.fieldId] ?? 0,
    }));
    // 정렬: 값 오름차순으로 분포 가시화
    rows.sort((a, b) => a.value - b.value);
    const vals = rows.map((r) => r.value);
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      values: rows,
      classAvg: vals.length ? Math.round((sum / vals.length) * 10) / 10 : 0,
      max: vals.length ? Math.max(...vals) : 0,
      min: vals.length ? Math.min(...vals) : 0,
    };
  }, [indicator, lesson.globalIndex, lrsData]);

  return (
    <div
      className="glass-card"
      style={{ background: '#ffffff', padding: 12 }}
    >
      {/* 제목 + 설명(인라인) + KPI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {indicator.label}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
            title={indicator.insight}
          >
            · {indicator.insight}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          <span>
            평균 <strong style={{ color: 'var(--color-primary)' }}>{classAvg}</strong>
            {indicator.unit}
          </span>
          <span>
            최저 {min} · 최고 {max}
          </span>
        </div>
      </div>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={values} margin={{ top: 18, right: 8, left: -20, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-dim)', fontSize: 9 }}
              angle={-40}
              textAnchor="end"
              interval={0}
              height={50}
            />
            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                fontSize: '0.78rem',
              }}
              formatter={(v: any) => [`${v}${indicator.unit}`, indicator.label]}
            />
            <ReferenceLine
              y={classAvg}
              stroke="var(--color-secondary)"
              strokeDasharray="4 4"
              label={{
                position: 'insideTopRight',
                value: `학급 평균 ${classAvg}${indicator.unit}`,
                fill: 'var(--color-secondary)',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// 저장된 맞춤 지표(CustomIndicator) 차트 - 수식 평가 + 시각화
// ────────────────────────────────────────────────
function evalFormulaForStudent(
  data: { [k: string]: number } | undefined,
  tokens: FormulaToken[],
): number {
  if (!tokens.length || !data) return 0;
  let expr = '';
  tokens.forEach((t) => {
    if (t.type === 'field') {
      expr += `(${data[t.value] ?? 0})`;
    } else if (t.type === 'function') {
      if (t.value === 'log') expr += 'Math.log10';
      else if (t.value === 'sqrt' || t.value === 'mean') expr += 'Math.sqrt';
    } else {
      expr += ` ${t.value} `;
    }
  });
  try {
    const v = new Function(`return ${expr}`)();
    if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) return 0;
    return Math.round(v * 100) / 100;
  } catch {
    return 0;
  }
}

interface CustomIndicatorChartProps {
  indicator: CustomIndicator;
  lesson: Lesson;
  lrsData: StudentXApiData[];
  onDelete: () => void;
}

const CustomIndicatorChart: React.FC<CustomIndicatorChartProps> = ({
  indicator,
  lesson,
  lrsData,
  onDelete,
}) => {
  const { rows, classAvg, max, min } = useMemo(() => {
    const r = lrsData.map((st) => ({
      name: st.studentName,
      value: evalFormulaForStudent(st.lessonsData[lesson.globalIndex], indicator.formula),
    }));
    r.sort((a, b) => a.value - b.value);
    const vals = r.map((x) => x.value);
    const sum = vals.reduce((a, b) => a + b, 0);
    return {
      rows: r,
      classAvg: vals.length ? Math.round((sum / vals.length) * 100) / 100 : 0,
      max: vals.length ? Math.max(...vals) : 0,
      min: vals.length ? Math.min(...vals) : 0,
    };
  }, [indicator, lesson.globalIndex, lrsData]);

  const formulaText = indicator.formula.map((t) => t.label).join(' ');

  return (
    <div
      className="glass-card"
      style={{
        background: '#ffffff',
        padding: 12,
        borderColor: 'rgba(79, 70, 229, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flex: 1, minWidth: 0 }}>
          <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 6px', flexShrink: 0 }}>
            맞춤
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', flexShrink: 0 }}>
            {indicator.name}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
            title={formulaText}
          >
            · 수식: {formulaText}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>
              평균 <strong style={{ color: 'var(--color-primary)' }}>{classAvg}</strong>
            </span>
            <span>
              {min} ~ {max}
            </span>
          </div>
          <button
            onClick={onDelete}
            aria-label="삭제"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: 2,
            }}
            title="이 지표 삭제"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderCustomChart(indicator.chartType, rows, classAvg)}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
