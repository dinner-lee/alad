'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ClassRoom, TeacherProfile } from '@/lib/types';
import {
  INITIAL_TEACHER_PROFILE,
  INITIAL_CLASSES,
  generateLrsForStudents,
} from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';
import { HomeView } from '@/components/HomeView';
import { ProfileView } from '@/components/ProfileView';
import { ClassDetailView } from '@/components/ClassDetailView';

const STORAGE = {
  PROFILE: 'alad_v2_profile',
  CLASSES: 'alad_v2_classes',
};

type View =
  | { kind: 'home' }
  | { kind: 'profile' }
  | { kind: 'classDetail'; classId: string };

function readJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`로컬 스토리지 파싱 실패: ${key}`, e);
    return fallback;
  }
}

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>(INITIAL_TEACHER_PROFILE);
  const [classes, setClasses] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [view, setView] = useState<View>({ kind: 'home' });

  useEffect(() => {
    setProfile(readJsonFromStorage(STORAGE.PROFILE, INITIAL_TEACHER_PROFILE));
    setClasses(readJsonFromStorage(STORAGE.CLASSES, INITIAL_CLASSES));
    setHydrated(true);
  }, []);

  const saveProfile = (p: TeacherProfile) => {
    setProfile(p);
    localStorage.setItem(STORAGE.PROFILE, JSON.stringify(p));
  };

  const saveClasses = (cs: ClassRoom[]) => {
    setClasses(cs);
    localStorage.setItem(STORAGE.CLASSES, JSON.stringify(cs));
  };

  const updateClass = (updated: ClassRoom) => {
    saveClasses(classes.map((c) => (c.id === updated.id ? updated : c)));
  };

  // 학급별 정체 학생 수를 미리 계산해 카드에 표시
  const stagnationCounts = useMemo(() => {
    if (!hydrated) return {};
    const result: Record<string, number> = {};
    classes.forEach((c) => {
      const lrs = generateLrsForStudents(c.students);
      const idx = c.currentLessonGlobalIndex;
      const last4 = [idx - 3, idx - 2, idx - 1, idx].filter((i) => i >= 1);
      let count = 0;
      lrs.forEach((st) => {
        const q = last4.map((i) => st.lessonsData[i]?.quiz_score ?? 70);
        const dur = last4.map((i) => st.lessonsData[i]?.session_duration ?? 1000);
        const declining =
          q.length >= 3 &&
          q[q.length - 1] < q[q.length - 2] &&
          q[q.length - 2] < q[q.length - 3];
        const veryLow = q[q.length - 1] < 50;
        const lowEngage = dur[dur.length - 1] < 400;
        if (declining || veryLow || lowEngage) count++;
      });
      result[c.id] = count;
    });
    return result;
  }, [classes, hydrated]);

  const currentClass = useMemo(() => {
    if (view.kind !== 'classDetail') return null;
    return classes.find((c) => c.id === view.classId) ?? null;
  }, [view, classes]);

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        로딩 중...
      </div>
    );
  }

  const navContext =
    view.kind === 'profile'
      ? '프로필 · 개인정보 수정'
      : view.kind === 'classDetail' && currentClass
        ? `${currentClass.grade} ${currentClass.classNumber}`
        : '';

  return (
    <>
      <Navbar
        profile={profile}
        onProfileClick={() => setView({ kind: 'profile' })}
        onLogoClick={() => setView({ kind: 'home' })}
        showBack={view.kind !== 'home'}
        onBack={() => setView({ kind: 'home' })}
        context={navContext}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '24px 20px 60px',
          minHeight: 'calc(100vh - 60px)',
        }}
      >
        {view.kind === 'home' && (
          <HomeView
            profile={profile}
            classes={classes}
            onSelectClass={(id) => setView({ kind: 'classDetail', classId: id })}
            onAddClass={() => setView({ kind: 'profile' })}
            stagnationCounts={stagnationCounts}
          />
        )}

        {view.kind === 'profile' && (
          <ProfileView
            profile={profile}
            classes={classes}
            onSaveProfile={saveProfile}
            onSaveClasses={saveClasses}
          />
        )}

        {view.kind === 'classDetail' && currentClass && (
          <ClassDetailView profile={profile} klass={currentClass} onChange={updateClass} />
        )}

        {view.kind === 'classDetail' && !currentClass && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            학급을 찾을 수 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
