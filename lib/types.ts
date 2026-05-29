export interface Student {
  id: string;
  name: string;
}

// 교사 프로필 (개인정보 + 전 학급 공통 컨텍스트)
export interface TeacherProfile {
  name: string;
  email: string;
  schoolLevel: string; // 초등학교, 중학교, 고등학교
  schoolName: string;
  subject: string; // 담당 교과
  semester: string; // 학기
}

// 학급 시간표 항목
export interface ClassSchedule {
  day: '월' | '화' | '수' | '목' | '금';
  period: number; // 1~7교시
}

// 학급 (담당 학급 단위)
export interface ClassRoom {
  id: string;
  grade: string; // 예: '3학년'
  classNumber: string; // 예: '1반'
  publisher: string; // 사용 교과서 출판사
  students: Student[];
  schedule: ClassSchedule[]; // 시간표
  units: Unit[]; // 학급별 단원 구성 (재구성 가능)
  lessons: Lesson[]; // 학급별 차시 설정
  currentLessonGlobalIndex: number; // 진행 중인 차시 번호
}

// 레거시: 기존 단일 설정 호환용 (마이그레이션 보조)
export interface TeacherSettings {
  schoolLevel: string;
  subject: string;
  semester: string;
  grade: string;
  classNumber: string;
  students: Student[];
  publisher: string;
}

export interface AchievementStandard {
  code: string;
  desc: string;
}

export interface Subunit {
  id: string;
  number: string;
  title: string;
  materials?: { title: string; type: string }[];
  lessonCount: number;
  lessonPlan: string;
  evaluationPlan: string;
  lessons: Lesson[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  achievementStandards: AchievementStandard[];
  subunits: Subunit[];
}

export interface ActivityTypes {
  participation: string[];
  goal: string[];
  format: string[];
}

export interface Lesson {
  id: string;
  subunitId: string;
  unitId: string;
  index: number;
  globalIndex: number;
  learningObjective: string;
  achievementStandards: string[];
  activityTypes: ActivityTypes;
  customIndicators: CustomIndicator[];
}

export interface FormulaToken {
  type: 'field' | 'operator' | 'number' | 'function';
  value: string;
  label: string;
}

export type ChartType = 'bar' | 'line' | 'scatter' | 'pie' | 'histogram';

export interface CustomIndicator {
  id: string;
  name: string;
  formula: FormulaToken[];
  chartType: ChartType;
  description: string;
}

export interface LongitudinalIndicator {
  id: string;
  name: string;
  formula: FormulaToken[];
  chartType: 'line' | 'area';
  description: string;
}

export interface XApiFieldDefinition {
  id: string;
  category: string;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
}

export interface StudentXApiData {
  studentId: string;
  studentName: string;
  lessonsData: {
    [lessonGlobalIndex: number]: {
      [fieldId: string]: number;
    };
  };
}
