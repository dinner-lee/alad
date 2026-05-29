'use client';

import React from 'react';
import { GraduationCap, ChevronLeft } from 'lucide-react';
import type { TeacherProfile } from '@/lib/types';

interface Props {
  profile: TeacherProfile;
  onProfileClick: () => void;
  onLogoClick: () => void;
  showBack?: boolean;
  onBack?: () => void;
  context?: string;
}

export const Navbar: React.FC<Props> = ({
  profile,
  onProfileClick,
  onLogoClick,
  showBack,
  onBack,
  context,
}) => {
  const initials = profile.name.slice(0, 1);
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && (
            <button
              onClick={onBack}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', gap: 4 }}
            >
              <ChevronLeft size={14} />
              홈으로
            </button>
          )}
          <div className="navbar-brand" onClick={onLogoClick}>
            <div
              style={{
                background: 'rgba(79, 70, 229, 0.1)',
                padding: 8,
                borderRadius: 8,
              }}
            >
              <GraduationCap size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1>ALAD · 학습 분석 지표 플랫폼</h1>
              {context && <div className="brand-sub">{context}</div>}
            </div>
          </div>
        </div>

        <button className="profile-btn" onClick={onProfileClick} aria-label="프로필 열기">
          <span className="profile-avatar">{initials}</span>
          <span className="profile-meta">
            <strong>{profile.name} 선생님</strong>
            <span>
              {profile.schoolName} · {profile.subject}
            </span>
          </span>
        </button>
      </div>
    </nav>
  );
};
