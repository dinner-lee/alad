'use client';

import React from 'react';
import type { ClassRoom, TeacherProfile } from '@/lib/types';
import {
  formatSchedule,
  getTodayKoreanDay,
  getTodaysLessonForClass,
  formatLessonLabel,
} from '@/lib/mockData';
import { Users, Calendar, BookOpen, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  profile: TeacherProfile;
  classes: ClassRoom[];
  onSelectClass: (id: string) => void;
  onAddClass: () => void;
  stagnationCounts: Record<string, number>;
}

export const HomeView: React.FC<Props> = ({
  profile,
  classes,
  onSelectClass,
  onAddClass,
  stagnationCounts,
}) => {
  const today = getTodayKoreanDay();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="section-header">
        <div>
          <h2>
            <Sparkles size={22} style={{ color: 'var(--color-primary)' }} />
            안녕하세요, {profile.name} 선생님
          </h2>
          <p>
            오늘은 <strong>{today}요일</strong>입니다. 지도 중인 {classes.length}개 학급의 오늘
            진행할 차시와 학습 정체 인사이트를 한눈에 확인하세요.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onAddClass} style={{ gap: 6 }}>
          <Plus size={16} /> 학급 추가
        </button>
      </div>

      <section className="class-grid">
        {classes.map((c) => {
          const today = getTodaysLessonForClass(c);
          const alerts = stagnationCounts[c.id] ?? 0;
          return (
            <article
              key={c.id}
              className="class-card"
              onClick={() => onSelectClass(c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectClass(c.id);
              }}
            >
              <header className="class-card-header">
                <div className="class-card-title">
                  <h3>
                    {c.grade} {c.classNumber}
                  </h3>
                  <span className="muted">{profile.subject} · {c.publisher}</span>
                </div>
                {alerts > 0 && (
                  <span className="class-card-alert" title="최근 4차시 기준 정체 위험 학생 수">
                    <AlertCircle size={11} /> {alerts}명 주의
                  </span>
                )}
              </header>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="class-meta-row">
                  <Users size={14} style={{ color: 'var(--color-success)' }} />
                  학생 {c.students.length}명
                </div>
                <div className="class-meta-row">
                  <Calendar size={14} style={{ color: 'var(--color-info)' }} />
                  {formatSchedule(c.schedule)}
                </div>
                <div className="class-meta-row">
                  <BookOpen size={14} style={{ color: 'var(--color-warning)' }} />
                  {c.units.length}개 단원 · 총 {c.lessons.length}차시
                </div>
              </div>

              <div className="class-card-today">
                <span className="label">
                  {today.hasClassToday
                    ? `오늘 ${today.period}교시 진행 예정`
                    : '오늘 수업 없음 · 다음 진행 차시'}
                </span>
                <span className="objective">
                  {today.upcomingLesson
                    ? `${formatLessonLabel(today.upcomingLesson, c.units, c.lessons)} · ${today.upcomingLesson.learningObjective.length > 60 ? today.upcomingLesson.learningObjective.slice(0, 60) + '…' : today.upcomingLesson.learningObjective}`
                    : '전 차시 종료'}
                </span>
                {today.upcomingLesson && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {today.upcomingLesson.activityTypes.format.slice(0, 3).map((f) => (
                      <span key={f} className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
