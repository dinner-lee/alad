'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type StepKey = 'settings' | 'units' | 'insights' | 'students';

export interface StepDef {
  key: StepKey;
  title: string;
  caption: string;
}

interface Props {
  current: StepKey;
  /** 완료된 단계 키 집합 (예: 교사 설정을 저장했으면 'settings' 포함) */
  completed: Set<StepKey>;
  onChange: (key: StepKey) => void;
}

export const STEPS: StepDef[] = [
  { key: 'settings', title: '교사 설정', caption: '학급·교과서 기초' },
  { key: 'units', title: '단원·차시 세팅', caption: '재구성 + 활동 유형' },
  { key: 'insights', title: '차시별 인사이트', caption: '지표 빌더 (수식)' },
  { key: 'students', title: '학생 종합 분석', caption: '종단 추이 + 정체' },
];

export const Stepper: React.FC<Props> = ({ current, completed, onChange }) => {
  return (
    <nav className="stepper" aria-label="진행 단계">
      {STEPS.map((step, idx) => {
        const isDone = completed.has(step.key);
        const isCurrent = current === step.key;
        const cls = isCurrent ? 'step step-current' : isDone ? 'step step-done' : 'step';
        return (
          <button
            key={step.key}
            type="button"
            className={cls}
            onClick={() => onChange(step.key)}
            aria-current={isCurrent ? 'step' : undefined}
            style={{ background: 'transparent', border: 'none', font: 'inherit' }}
          >
            <span className="step-bubble">
              {isDone && !isCurrent ? <Check size={16} strokeWidth={3} /> : idx + 1}
            </span>
            <span className="step-title">{step.title}</span>
            <span className="step-caption">{step.caption}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface NextStepBarProps {
  doneLabel: string;
  nextLabel: string;
  nextDescription: string;
  onNext: () => void;
}

export const NextStepBar: React.FC<NextStepBarProps> = ({
  doneLabel,
  nextLabel,
  nextDescription,
  onNext,
}) => (
  <div className="next-step-bar">
    <div className="ns-text">
      <strong>{doneLabel}</strong>
      <span>{nextDescription}</span>
    </div>
    <button className="btn btn-primary" onClick={onNext} style={{ gap: 6 }}>
      {nextLabel} →
    </button>
  </div>
);
