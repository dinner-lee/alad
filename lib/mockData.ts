import type {
  Unit,
  XApiFieldDefinition,
  StudentXApiData,
  Lesson,
  TeacherProfile,
  ClassRoom,
  ClassSchedule,
  Student,
} from './types';

// =====================================================
// 0. 학교급/과목별 사용 가능 교과서 출판사
// =====================================================
export const PUBLISHERS_BY_SUBJECT: Record<string, string[]> = {
  국어: ['천재교과서(노미숙)', '미래엔(신유식)', '비상교육(김진수)', '동아출판(이은영)', '금성출판사(김종철)'],
  영어: ['YBM(송미정)', '능률(양현권)', '천재교육(이재영)', '미래엔(최연희)'],
  수학: ['천재교육(류희찬)', '미래엔(황선욱)', '비상교육(김원경)', '동아출판(고성은)'],
  사회: ['비상교육(박형준)', '미래엔(이진석)', '천재교육(이진석)'],
  과학: ['미래엔(이진명)', '천재교육(노태희)', '비상교육(임태훈)'],
};

// =====================================================
// 1. 천재교과서(노미숙) 국어 중학교 3학년 2학기 교과 데이터
// =====================================================
export const DEFAULT_UNITS: Unit[] = [
  {
    id: 'unit_1',
    number: 1,
    title: '문학과 삶',
    achievementStandards: [
      { code: '9국05-05', desc: '작품이 창작된 사회·문화적 배경을 바탕으로 작품을 이해한다.' },
      { code: '9국05-06', desc: '과거의 삶이 반영된 작품을 오늘날의 삶에 비추어 감상한다.' }
    ],
    subunits: [
      {
        id: 'subunit_1_1',
        number: '(1)',
        title: '까마귀 눈비 맞아 / 들판이 적막하다',
        materials: [
          { title: '보물(강인봉 작사)', type: '노랫말' },
          { title: '까마귀 눈비 맞아(박팽년)', type: '고시조' },
          { title: '들판이 적막하다(정현종)', type: '현대시' }
        ],
        lessonCount: 3,
        lessonPlan: '문학 작품의 배경 이해 및 오늘날의 삶과 연결하여 감상하기',
        evaluationPlan: '시조/현대시 구술 발표 및 감상문 작성 평가',
        lessons: []
      },
      {
        id: 'subunit_1_2',
        number: '(2)',
        title: '꺼삐딴 리',
        materials: [
          { title: '꺼삐딴 리(전광용)', type: '현대 소설' }
        ],
        lessonCount: 3,
        lessonPlan: '일제강점기~해방 직후의 사회·문화적 배경을 바탕으로 소설 인물의 삶 비판적으로 분석하기',
        evaluationPlan: '인물 가치관 비판 토론 및 에세이 쓰기',
        lessons: []
      },
      {
        id: 'subunit_1_extra',
        number: '더 읽어 보기',
        title: '세 얼간이',
        materials: [
          { title: '세 얼간이(애브히짓 조시 외)', type: '시나리오' }
        ],
        lessonCount: 1,
        lessonPlan: '시나리오의 극적 갈등과 현대 교육의 문제점 연결하기',
        evaluationPlan: '진로와 행복에 관한 단편 글쓰기',
        lessons: []
      }
    ]
  },
  {
    id: 'unit_2',
    number: 2,
    title: '논증과 설득 전략',
    achievementStandards: [
      { code: '9국02-05', desc: '글에 사용된 다양한 논증 방법을 파악하며 읽는다.' }
    ],
    subunits: [
      {
        id: 'subunit_2_1',
        number: '(1)',
        title: '논증 방법 파악하며 읽기',
        materials: [
          { title: '왜 속도를 고민해야 하는가?(김용섭)', type: '주장하는 글' },
          { title: '이옥설(이규보)', type: '설(說)' }
        ],
        lessonCount: 3,
        lessonPlan: '귀납, 연역, 유추 등 논증 방식 구별 및 타당성 분석',
        evaluationPlan: '논증 방법 분석 퀴즈 및 요약지 작성',
        lessons: []
      },
      {
        id: 'subunit_2_2',
        number: '(2)',
        title: '설득 전략 비판적으로 분석하며 듣기',
        materials: [
          { title: '나에게는 꿈이 있습니다(마틴 루서 킹)', type: '연설' },
          { title: '바다를 지켜 주세요(해양환경공단)', type: '공익 광고' },
          { title: '평창 동계 올림픽 유치 연설(김연아)', type: '연설' }
        ],
        lessonCount: 3,
        lessonPlan: '설득 전략(이성적, 감성적, 인격적) 분석 및 매체 표현의 설득 효과 비판적 듣기',
        evaluationPlan: '광고 및 연설문 설득 전략 분석 보고서 평가',
        lessons: []
      },
      {
        id: 'subunit_2_extra',
        number: '더 읽어 보기',
        title: '논증의 오류',
        materials: [
          { title: '논증의 오류(생각 공장)', type: '설명문' }
        ],
        lessonCount: 1,
        lessonPlan: '오류의 종류(인신공격, 군중에 호소, 피장파장 등) 이해하기',
        evaluationPlan: '일상 속 논리적 오류 찾기 짝 평가',
        lessons: []
      }
    ]
  },
  {
    id: 'unit_3',
    number: 3,
    title: '문장과 글쓰기',
    achievementStandards: [
      { code: '9국04-06', desc: '문장의 짜임과 양상을 탐구하고 활용한다.' },
      { code: '9국03-10', desc: '쓰기 윤리를 지키며 글을 쓰는 태도를 지닌다.' },
      { code: '9국03-03', desc: '관찰, 조사, 실험의 절차와 결과가 드러나게 글을 쓴다.' }
    ],
    subunits: [
      {
        id: 'subunit_3_1',
        number: '(1)',
        title: '문장의 짜임과 양상',
        lessonCount: 3,
        lessonPlan: '홑문장과 겹문장(안은문장, 이어진문장) 분석 및 정확한 문장 작성법 학습',
        evaluationPlan: '문장의 짜임 구분 탐구 평가 및 형성 평가',
        lessons: []
      },
      {
        id: 'subunit_3_2',
        number: '(2)',
        title: '쓰기 윤리와 보고서 쓰기',
        materials: [
          { title: '쓰기 윤리를 지키며 글 쓰기', type: '만화' },
          { title: '우리 학교 학생들의 스마트폰 사용 실태', type: '보고서(조사 보고서)' }
        ],
        lessonCount: 3,
        lessonPlan: '표절 금지, 출처 표기 등 쓰기 윤리 탐색 및 설문 조사 보고서 작성',
        evaluationPlan: '모둠별 실태 조사 보고서 및 출처 표기 신뢰성 평가',
        lessons: []
      },
      {
        id: 'subunit_3_extra',
        number: '더 읽어 보기',
        title: '쓰기 윤리에 대하여',
        materials: [
          { title: '쓰기 윤리에 대하여(이수형)', type: '설명문' }
        ],
        lessonCount: 1,
        lessonPlan: '연구 윤리와 일상적 글쓰기 윤리의 중요성 고찰',
        evaluationPlan: '쓰기 윤리 실천 서약서 작성',
        lessons: []
      }
    ]
  },
  {
    id: 'unit_4',
    number: 4,
    title: '점검과 조정',
    achievementStandards: [
      { code: '9국02-09', desc: '자신의 읽기 과정을 점검하고 효과적으로 조정하며 읽는다.' },
      { code: '9국01-06', desc: '청중의 관심과 요구를 고려하여 말한다.' },
      { code: '9국01-07', desc: '여러 사람 앞에서 말할 때 부딪히는 어려움에 효과적으로 대처한다.' }
    ],
    subunits: [
      {
        id: 'subunit_4_1',
        number: '(1)',
        title: '읽기 과정을 점검하며 읽기',
        materials: [
          { title: '읽기를 잘하려면', type: '설명문' },
          { title: '절로 뛰어들게 만드는 씨름판의 풍경(오주석)', type: '설명문' },
          { title: '많이 만들수록 줄어드는 생산비의 비밀(한진수)', type: '설명문' }
        ],
        lessonCount: 3,
        lessonPlan: '독서 전·중·후 인지 점검 전략 활용 및 중심 생각 요약',
        evaluationPlan: '읽기 과정 점검 기록장(학습 로그) 및 상호 점검 동료 평가',
        lessons: []
      },
      {
        id: 'subunit_4_2',
        number: '(2)',
        title: '청중을 고려하며 자신 있게 말하기',
        materials: [
          { title: '말하기의 달인이 되기까지', type: '만화' }
        ],
        lessonCount: 2,
        lessonPlan: '말하기 불안 극복 방안, 청중 분석을 통한 발표 자료 구성',
        evaluationPlan: '1분 스피치 및 청중 호응도 평가',
        lessons: []
      },
      {
        id: 'subunit_4_extra',
        number: '더 읽어 보기',
        title: '발표하기 무서워요!',
        materials: [
          { title: '발표하기 무서워요!(미나 뤼스타)', type: '동화' }
        ],
        lessonCount: 1,
        lessonPlan: '말하기 불안에 관한 심리적 조절 요인 이해',
        evaluationPlan: '발표 불안 극복 경험 나누기 글쓰기',
        lessons: []
      }
    ]
  }
];

// =====================================================
// 1-2. 미래엔(신유식) 국어 중학교 3학년 2학기 교과 데이터 (단순화 버전)
// =====================================================
export const MIRAEN_UNITS: Unit[] = [
  {
    id: 'm_unit_1',
    number: 1,
    title: '문학의 다층적 이해',
    achievementStandards: [
      { code: '9국05-05', desc: '작품이 창작된 사회·문화적 배경을 바탕으로 작품을 이해한다.' },
      { code: '9국05-09', desc: '자신의 가치 있는 경험을 개성적인 발상과 표현으로 형상화한다.' },
    ],
    subunits: [
      {
        id: 'm_sub_1_1',
        number: '(1)',
        title: '현대시와 시조의 만남',
        materials: [
          { title: '청포도(이육사)', type: '현대시' },
          { title: '훈민가(정철)', type: '연시조' },
        ],
        lessonCount: 3,
        lessonPlan: '작품 속 시대적 배경 탐색 및 시적 표현 분석',
        evaluationPlan: '시 감상문 작성 평가',
        lessons: [],
      },
      {
        id: 'm_sub_1_2',
        number: '(2)',
        title: '소설로 들여다본 사회',
        materials: [{ title: '동백꽃(김유정)', type: '현대 소설' }],
        lessonCount: 3,
        lessonPlan: '인물 갈등 양상과 사회적 의미 토론',
        evaluationPlan: '인물 분석 에세이',
        lessons: [],
      },
    ],
  },
  {
    id: 'm_unit_2',
    number: 2,
    title: '비판적 사고와 매체',
    achievementStandards: [
      { code: '9국02-05', desc: '글에 사용된 다양한 논증 방법을 파악하며 읽는다.' },
      { code: '9국01-03', desc: '목적에 맞게 질문을 준비하여 면담한다.' },
    ],
    subunits: [
      {
        id: 'm_sub_2_1',
        number: '(1)',
        title: '논증과 매체 분석',
        materials: [{ title: '디지털 시대의 정보 윤리', type: '논설문' }],
        lessonCount: 3,
        lessonPlan: '논증 방법 분류 및 매체 텍스트 비판적 읽기',
        evaluationPlan: '논증 분석 모둠 토의 평가',
        lessons: [],
      },
      {
        id: 'm_sub_2_2',
        number: '(2)',
        title: '면담과 보고하기',
        lessonCount: 2,
        lessonPlan: '목적에 맞는 질문 설계 및 면담 실시',
        evaluationPlan: '면담 보고서 평가',
        lessons: [],
      },
    ],
  },
];

// =====================================================
// 출판사별 기본 단원 헬퍼
// =====================================================
export function getDefaultUnitsByPublisher(publisher: string): Unit[] {
  if (publisher.startsWith('미래엔')) {
    return MIRAEN_UNITS;
  }
  // 기본값: 천재교과서
  return DEFAULT_UNITS;
}

// 미래엔 단원에 대응하는 빈 차시 생성
export function generateLessonsFromUnits(units: Unit[]): Lesson[] {
  const lessons: Lesson[] = [];
  let globalIndex = 1;

  units.forEach((unit) => {
    unit.subunits.forEach((sub) => {
      for (let i = 1; i <= sub.lessonCount; i++) {
        lessons.push({
          id: `lesson_${unit.id}_${sub.id}_${i}`,
          subunitId: sub.id,
          unitId: unit.id,
          index: i,
          globalIndex: globalIndex++,
          learningObjective: `${sub.title} - ${i}차시 학습목표 (교사가 작성)`,
          achievementStandards:
            unit.achievementStandards.length > 0 ? [unit.achievementStandards[0].code] : [],
          activityTypes: {
            participation: ['개인학습'],
            goal: ['개념 학습'],
            format: ['개념 이해'],
          },
          customIndicators: [],
        });
      }
    });
  });

  return lessons;
}

export function getPreconfiguredLessonsByPublisher(publisher: string): Lesson[] {
  if (publisher.startsWith('미래엔')) {
    return generateLessonsFromUnits(MIRAEN_UNITS);
  }
  return PRECONFIGURED_LESSONS;
}

// =====================================================
// 2. xAPI 기반 학습데이터 사전 필드 정의
// =====================================================
export const XAPI_FIELDS: XApiFieldDefinition[] = [
  // 참여 카테고리
  { id: 'page_views', category: '참여', label: '페이지 열람 횟수', description: '차시 학습 화면의 총 페이지 로드/조회 수', unit: '회', min: 0, max: 40 },
  { id: 'session_duration', category: '참여', label: '페이지 접속 시간', description: '세션당 접속하여 학습에 머무른 시간', unit: '초', min: 0, max: 3600 },
  { id: 'login_count', category: '참여', label: '로그인 횟수', description: '학습 기간 중 플랫폼에 로그인한 횟수', unit: '회', min: 1, max: 5 },
  { id: 'media_play_count', category: '참여', label: '미디어 재생 횟수', description: '동영상 및 음원 자료 재생 버튼 클릭 수', unit: '회', min: 0, max: 10 },
  
  // 상호작용 카테고리
  { id: 'shared_materials', category: '상호작용', label: '모둠 공유 자료수', description: '모둠 보드 또는 협동 문서에 링크나 파일을 공유한 개수', unit: '개', min: 0, max: 15 },
  { id: 'comment_views', category: '상호작용', label: '동료 댓글 조회 횟수', description: '다른 학생이 작성한 의견/댓글을 읽은 횟수', unit: '회', min: 0, max: 50 },
  { id: 'comment_writes', category: '상호작용', label: '의견/댓글 작성 횟수', description: '동료 글에 대한 반응, 질문에 대한 댓글을 작성한 횟수', unit: '회', min: 0, max: 20 },
  { id: 'interaction_score', category: '상호작용', label: '의사소통 상호작용수', description: '답글 스레드 및 실시간 채팅을 통한 주고받기 횟수', unit: '회', min: 0, max: 30 },
  { id: 'quiz_discussion_time', category: '상호작용', label: '오답 토의 시간', description: '퀴즈 종료 후 모둠방에서 정답 오답 토론에 보낸 시간', unit: '초', min: 0, max: 600 },

  // 결과/평가 카테고리
  { id: 'quiz_score', category: '결과/평가', label: '퀴즈 평가 점수', description: '차시 퀴즈의 최종 획득 점수', unit: '점', min: 0, max: 100 },
  { id: 'assignment_sub_time', category: '결과/평가', label: '과제 제출 속도', description: '과제 오픈 시점부터 최종 제출 시점까지 걸린 시간 (적을수록 빨리 제출)', unit: '분', min: 5, max: 60 },
  { id: 'assignment_edits', category: '결과/평가', label: '과제 수정 보완 횟수', description: '최초 임시 저장 후 수정한 횟수', unit: '회', min: 0, max: 15 },
  { id: 'writing_score', category: '결과/평가', label: '글쓰기 본문 자수', description: '작성한 에세이 또는 감상문의 텍스트 총 글자수', unit: '자', min: 0, max: 1200 },
  { id: 'presentation_grade', category: '결과/평가', label: '발표 평가 점수', description: '동료/교사 평가를 합산한 스피치 수행 점수', unit: '점', min: 0, max: 100 },

  // 피드백 카테고리
  { id: 'feedback_view_time', category: '피드백', label: '피드백 확인 속도', description: '교사/동료 피드백이 등록된 후 조회하기까지 걸린 시간 (적을수록 빠르게 피드백 확인)', unit: '분', min: 1, max: 120 },
  { id: 'feedback_views', category: '피드백', label: '피드백 확인 횟수', description: '교사가 단 댓글이나 첨삭 결과를 열람한 횟수', unit: '회', min: 0, max: 10 },
  { id: 'feedback_rec_count', category: '피드백', label: '제공받은 피드백 수', description: '동료 및 교사로부터 받은 텍스트/이모지 피드백의 총 개수', unit: '개', min: 0, max: 8 },
  { id: 'peer_work_view_time', category: '피드백', label: '동료 과제 조회 시간', description: '갤러리 워크 등에서 동료들의 결과물을 관찰하며 머무른 총 시간', unit: '초', min: 0, max: 900 },

  // 협력학습 카테고리 (학습데이터사전 기반: 온라인 토의 활동에서 수집되는 협력학습 로그)
  { id: 'collab_result_check_time', category: '협력학습', label: '협력 결과물 평가 확인 시각', description: '모둠 활동 결과물 평가가 등록된 후 확인까지의 경과 시간', unit: '분', min: 1, max: 180 },
  { id: 'collab_feedback_check_time', category: '협력학습', label: '협력 피드백 확인 시각', description: '협력학습 피드백이 등록된 후 학생이 열람할 때까지의 시간', unit: '분', min: 1, max: 120 },
  { id: 'collab_feedback_count', category: '협력학습', label: '협력 피드백 확인 횟수', description: '협력학습 활동에서 받은 피드백 열람 횟수', unit: '회', min: 0, max: 12 },
  { id: 'collab_feedback_types', category: '협력학습', label: '협력 피드백 유형 다양성', description: '학생이 작성/수신한 피드백의 유형(질문, 보충, 칭찬 등) 다양성 점수', unit: '종', min: 0, max: 5 },
  { id: 'collab_feedback_given', category: '협력학습', label: '협력 피드백 제공 횟수', description: '모둠원에게 피드백을 제공한 횟수', unit: '회', min: 0, max: 15 },
  { id: 'collab_submit_time', category: '협력학습', label: '협력 결과물 제출 시각', description: '협력학습 결과물이 마감 전에 제출된 여유 시간(분)', unit: '분', min: 0, max: 360 },
  { id: 'collab_revise_count', category: '협력학습', label: '협력 결과물 수정 보완 횟수', description: '제출 후 모둠원과 함께 수정 보완한 누적 횟수', unit: '회', min: 0, max: 12 },
  { id: 'collab_result_view_time', category: '협력학습', label: '협력 결과물 확인 시간', description: '모둠 결과물을 학생 본인이 확인/검토한 누적 시간', unit: '초', min: 0, max: 1500 },
  { id: 'collab_group_comment_views', category: '협력학습', label: '모둠원 댓글 조회 횟수', description: '협력학습 활동에서 모둠원 댓글을 조회한 횟수', unit: '회', min: 0, max: 60 },
  { id: 'collab_group_comment_writes', category: '협력학습', label: '모둠원 댓글 달기 횟수', description: '협력학습 활동 중 모둠원 글에 댓글을 단 횟수', unit: '회', min: 0, max: 25 },
  { id: 'collab_group_interaction', category: '협력학습', label: '모둠원 상호작용 점수', description: '모둠 채팅, 보드 공동 편집, 답글 스레드를 종합한 상호작용 지수', unit: '점', min: 0, max: 100 }
];

// 3. 25명의 가상 학생 목록
export const INITIAL_STUDENTS = [
  { id: 'std_01', name: '강민준' },
  { id: 'std_02', name: '김서연' },
  { id: 'std_03', name: '이도윤' },
  { id: 'std_04', name: '박예준' },
  { id: 'std_05', name: '최시우' },
  { id: 'std_06', name: '정주원' },
  { id: 'std_07', name: '윤하은' },
  { id: 'std_08', name: '한지아' },
  { id: 'std_09', name: '임주율' },
  { id: 'std_10', name: '오현우' },
  { id: 'std_11', name: '송지우' },
  { id: 'std_12', name: '신민서' },
  { id: 'std_13', name: '유도현' },
  { id: 'std_14', name: '황건우' },
  { id: 'std_15', name: '안서진' },
  { id: 'std_16', name: '양지안' },
  { id: 'std_17', name: '권우진' },
  { id: 'std_18', name: '배서현' },
  { id: 'std_19', name: '백준우' },
  { id: 'std_20', name: '고은지' },
  { id: 'std_21', name: '홍길동' },
  { id: 'std_22', name: '심청이' },
  { id: 'std_23', name: '성춘향' },
  { id: 'std_24', name: '이몽룡' },
  { id: 'std_25', name: '임꺽정' }
];

// 학생들의 학습 스타일 시뮬레이션용 프로필 정의
// 'top' (최우수), 'normal' (평범), 'improving' (성장형), 'dropping' (정체/급락형), 'unengaged' (방관/저참여형)
const STUDENT_PROFILES: { [key: string]: 'top' | 'normal' | 'improving' | 'dropping' | 'unengaged' } = {
  std_01: 'top',
  std_02: 'normal',
  std_03: 'normal',
  std_04: 'improving', // 퀴즈 성적 및 접속 시간이 점점 좋아짐
  std_05: 'dropping',  // 4차시 이후부터 퀴즈 및 피드백 확인 등 전반적 수치 급락 (학습 정체 유력)
  std_06: 'normal',
  std_07: 'top',
  std_08: 'unengaged', // 시종일관 참여도가 매우 낮고 (접속 시간 짧음, 로그인 겨우 함), 과제 수정 0회
  std_09: 'normal',
  std_10: 'normal',
  std_11: 'improving', // 초기엔 낮았으나 중반 이후 댓글 및 상호작용 급증하며 성적 상승
  std_12: 'dropping',  // 5차시부터 페이지 접속 시간 및 퀴즈 점수가 우하향
  std_13: 'normal',
  std_14: 'normal',
  std_15: 'top',
  std_16: 'normal',
  std_17: 'unengaged', // 로그인 횟수 1~2회에 그치고, 글자수 적음
  std_18: 'normal',
  std_19: 'normal',
  std_20: 'dropping',  // 3차시부터 피드백 확인 속도 급감, 로그인 횟수 저하 (정체 유력)
  std_21: 'normal',
  std_22: 'normal',
  std_23: 'top',
  std_24: 'normal',
  std_25: 'normal'
};

// 각 프로필에 맞는 데이터 밸류를 생성하는 헬퍼 함수
const generateFieldVal = (
  profile: 'top' | 'normal' | 'improving' | 'dropping' | 'unengaged',
  fieldId: string,
  lessonIdx: number, // 1~12 (총 차시)
  totalLessons: number = 12
): number => {
  // 난수 노이즈
  const noise = () => Math.random() * 10 - 5; // -5 ~ +5
  const t = lessonIdx / totalLessons; // 0.08 ~ 1.0 (시간 흐름 비율)

  switch (fieldId) {
    case 'page_views': {
      if (profile === 'top') return Math.round(28 + Math.random() * 8);
      if (profile === 'unengaged') return Math.round(3 + Math.random() * 4);
      if (profile === 'improving') return Math.round(10 + t * 25 + noise());
      if (profile === 'dropping') {
        const base = t > 0.4 ? 20 - (t - 0.4) * 35 : 22;
        return Math.max(2, Math.round(base + noise()));
      }
      // normal
      return Math.round(15 + Math.random() * 10);
    }
    
    case 'session_duration': {
      if (profile === 'top') return Math.round(2400 + Math.random() * 1000);
      if (profile === 'unengaged') return Math.round(150 + Math.random() * 200);
      if (profile === 'improving') return Math.round(600 + t * 2000 + noise() * 20);
      if (profile === 'dropping') {
        const base = t > 0.4 ? 1600 - (t - 0.4) * 2400 : 1700;
        return Math.max(100, Math.round(base + noise() * 15));
      }
      return Math.round(900 + Math.random() * 900);
    }

    case 'login_count': {
      if (profile === 'top') return Math.round(4 + Math.random() * 1);
      if (profile === 'unengaged') return 1;
      if (profile === 'improving') return t > 0.5 ? 4 : 2;
      if (profile === 'dropping') return t > 0.5 ? 1 : 3;
      return Math.round(2 + Math.random() * 2);
    }

    case 'media_play_count': {
      if (profile === 'top') return Math.round(7 + Math.random() * 3);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 2);
      if (profile === 'improving') return Math.round(3 + t * 6);
      if (profile === 'dropping') return t > 0.5 ? 1 : 5;
      return Math.round(3 + Math.random() * 4);
    }

    case 'shared_materials': {
      if (profile === 'top') return Math.round(8 + Math.random() * 5);
      if (profile === 'unengaged') return 0;
      if (profile === 'improving') return Math.round(1 + t * 9 + noise() * 0.2);
      if (profile === 'dropping') return t > 0.5 ? 0 : Math.round(3 + noise() * 0.1);
      return Math.round(2 + Math.random() * 4);
    }

    case 'comment_views': {
      if (profile === 'top') return Math.round(35 + Math.random() * 15);
      if (profile === 'unengaged') return Math.round(1 + Math.random() * 4);
      if (profile === 'improving') return Math.round(8 + t * 30 + noise() * 2);
      if (profile === 'dropping') return t > 0.4 ? Math.max(0, Math.round(18 - (t - 0.4) * 30)) : 15;
      return Math.round(12 + Math.random() * 15);
    }

    case 'comment_writes': {
      if (profile === 'top') return Math.round(12 + Math.random() * 6);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 2);
      if (profile === 'improving') return Math.round(2 + t * 13 + noise());
      if (profile === 'dropping') return t > 0.4 ? Math.max(0, Math.round(7 - (t - 0.4) * 12)) : 6;
      return Math.round(3 + Math.random() * 6);
    }

    case 'interaction_score': {
      if (profile === 'top') return Math.round(22 + Math.random() * 6);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 2);
      if (profile === 'improving') return Math.round(4 + t * 18 + noise());
      if (profile === 'dropping') return t > 0.4 ? Math.max(0, Math.round(12 - (t - 0.4) * 20)) : 11;
      return Math.round(6 + Math.random() * 10);
    }

    case 'quiz_discussion_time': {
      if (profile === 'top') return Math.round(450 + Math.random() * 120);
      if (profile === 'unengaged') return 0;
      if (profile === 'improving') return Math.round(100 + t * 400);
      if (profile === 'dropping') return t > 0.5 ? 20 : 250;
      return Math.round(180 + Math.random() * 180);
    }

    case 'quiz_score': {
      // 100점 만점
      if (profile === 'top') return Math.round(92 + Math.random() * 8);
      if (profile === 'unengaged') return Math.round(40 + Math.random() * 20);
      if (profile === 'improving') return Math.min(100, Math.round(55 + t * 40 + noise() * 0.5));
      if (profile === 'dropping') {
        const base = t > 0.4 ? 80 - (t - 0.4) * 85 : 82;
        return Math.max(25, Math.round(base + noise() * 0.4));
      }
      return Math.round(68 + Math.random() * 22);
    }

    case 'assignment_sub_time': {
      // 시간(분) - 적을수록 우수 (과제를 빨리 완성)
      if (profile === 'top') return Math.round(12 + Math.random() * 5);
      if (profile === 'unengaged') return Math.round(50 + Math.random() * 10);
      if (profile === 'improving') return Math.max(8, Math.round(45 - t * 28 + noise() * 0.2));
      if (profile === 'dropping') {
        const base = t > 0.4 ? 22 + (t - 0.4) * 60 : 20;
        return Math.min(60, Math.round(base + noise() * 0.3));
      }
      return Math.round(20 + Math.random() * 20);
    }

    case 'assignment_edits': {
      if (profile === 'top') return Math.round(9 + Math.random() * 4);
      if (profile === 'unengaged') return 0;
      if (profile === 'improving') return Math.round(1 + t * 10);
      if (profile === 'dropping') return t > 0.5 ? 0 : 4;
      return Math.round(2 + Math.random() * 5);
    }

    case 'writing_score': {
      // 글자수 (1200자 만점 기준)
      if (profile === 'top') return Math.round(950 + Math.random() * 200);
      if (profile === 'unengaged') return Math.round(100 + Math.random() * 150);
      if (profile === 'improving') return Math.round(300 + t * 700 + noise() * 5);
      if (profile === 'dropping') {
        const base = t > 0.4 ? 650 - (t - 0.4) * 800 : 700;
        return Math.max(50, Math.round(base + noise() * 3));
      }
      return Math.round(400 + Math.random() * 400);
    }

    case 'presentation_grade': {
      if (profile === 'top') return Math.round(90 + Math.random() * 10);
      if (profile === 'unengaged') return Math.round(50 + Math.random() * 15);
      if (profile === 'improving') return Math.min(100, Math.round(60 + t * 35));
      if (profile === 'dropping') return t > 0.5 ? 45 : 80;
      return Math.round(70 + Math.random() * 20);
    }

    case 'feedback_view_time': {
      // 분 - 적을수록 빠름 (피드백을 즉시 열람함)
      if (profile === 'top') return Math.round(3 + Math.random() * 4);
      if (profile === 'unengaged') return Math.round(90 + Math.random() * 30);
      if (profile === 'improving') return Math.max(2, Math.round(60 - t * 50 + noise() * 0.5));
      if (profile === 'dropping') {
        const base = t > 0.4 ? 15 + (t - 0.4) * 160 : 12;
        return Math.min(120, Math.round(base + noise()));
      }
      return Math.round(15 + Math.random() * 35);
    }

    case 'feedback_views': {
      if (profile === 'top') return Math.round(7 + Math.random() * 3);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 1);
      if (profile === 'improving') return Math.round(1 + t * 7);
      if (profile === 'dropping') return t > 0.5 ? 0 : 4;
      return Math.round(2 + Math.random() * 4);
    }

    case 'feedback_rec_count': {
      if (profile === 'top') return Math.round(5 + Math.random() * 3);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 2);
      if (profile === 'improving') return Math.round(2 + t * 5);
      if (profile === 'dropping') return t > 0.5 ? 1 : 4;
      return Math.round(2 + Math.random() * 3);
    }

    case 'peer_work_view_time': {
      if (profile === 'top') return Math.round(600 + Math.random() * 250);
      if (profile === 'unengaged') return Math.round(10 + Math.random() * 40);
      if (profile === 'improving') return Math.round(100 + t * 600);
      if (profile === 'dropping') return t > 0.5 ? 30 : 400;
      return Math.round(200 + Math.random() * 300);
    }

    // ───── 협력학습 카테고리 ─────
    case 'collab_result_check_time':
    case 'collab_feedback_check_time': {
      if (profile === 'top') return Math.round(5 + Math.random() * 8);
      if (profile === 'unengaged') return Math.round(90 + Math.random() * 60);
      if (profile === 'improving') return Math.max(3, Math.round(80 - t * 65));
      if (profile === 'dropping') return t > 0.4 ? Math.round(20 + (t - 0.4) * 130) : 18;
      return Math.round(25 + Math.random() * 30);
    }

    case 'collab_feedback_count':
    case 'collab_feedback_given': {
      if (profile === 'top') return Math.round(9 + Math.random() * 4);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 1);
      if (profile === 'improving') return Math.round(1 + t * 9);
      if (profile === 'dropping') return t > 0.5 ? 1 : 5;
      return Math.round(3 + Math.random() * 4);
    }

    case 'collab_feedback_types': {
      if (profile === 'top') return Math.round(4 + Math.random());
      if (profile === 'unengaged') return Math.round(Math.random());
      if (profile === 'improving') return Math.round(1 + t * 3);
      if (profile === 'dropping') return t > 0.5 ? 1 : 3;
      return Math.round(2 + Math.random() * 2);
    }

    case 'collab_submit_time': {
      // 마감 전 여유 시간 - 클수록 일찍 제출
      if (profile === 'top') return Math.round(180 + Math.random() * 120);
      if (profile === 'unengaged') return Math.round(5 + Math.random() * 15);
      if (profile === 'improving') return Math.round(40 + t * 200);
      if (profile === 'dropping') return t > 0.5 ? 10 : 120;
      return Math.round(60 + Math.random() * 100);
    }

    case 'collab_revise_count': {
      if (profile === 'top') return Math.round(7 + Math.random() * 4);
      if (profile === 'unengaged') return 0;
      if (profile === 'improving') return Math.round(1 + t * 8);
      if (profile === 'dropping') return t > 0.5 ? 0 : 4;
      return Math.round(2 + Math.random() * 4);
    }

    case 'collab_result_view_time': {
      if (profile === 'top') return Math.round(900 + Math.random() * 400);
      if (profile === 'unengaged') return Math.round(20 + Math.random() * 80);
      if (profile === 'improving') return Math.round(200 + t * 1000);
      if (profile === 'dropping') return t > 0.5 ? 100 : 600;
      return Math.round(400 + Math.random() * 500);
    }

    case 'collab_group_comment_views': {
      if (profile === 'top') return Math.round(40 + Math.random() * 18);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 5);
      if (profile === 'improving') return Math.round(8 + t * 38);
      if (profile === 'dropping') return t > 0.4 ? Math.max(0, Math.round(20 - (t - 0.4) * 35)) : 18;
      return Math.round(15 + Math.random() * 18);
    }

    case 'collab_group_comment_writes': {
      if (profile === 'top') return Math.round(15 + Math.random() * 8);
      if (profile === 'unengaged') return Math.round(0 + Math.random() * 1);
      if (profile === 'improving') return Math.round(2 + t * 16);
      if (profile === 'dropping') return t > 0.4 ? Math.max(0, Math.round(8 - (t - 0.4) * 14)) : 7;
      return Math.round(4 + Math.random() * 7);
    }

    case 'collab_group_interaction': {
      if (profile === 'top') return Math.round(80 + Math.random() * 18);
      if (profile === 'unengaged') return Math.round(5 + Math.random() * 12);
      if (profile === 'improving') return Math.round(20 + t * 70);
      if (profile === 'dropping') return t > 0.4 ? Math.max(0, Math.round(60 - (t - 0.4) * 90)) : 60;
      return Math.round(40 + Math.random() * 30);
    }

    default:
      return 0;
  }
};

// 4. 모의 학생 LRS 로그 생성 함수 (총 27차시 기준 시뮬레이션 데이터 제공)
export const generateMockLrsData = (): StudentXApiData[] => {
  const students = INITIAL_STUDENTS;
  const totalLessonsCount = 27; // 시뮬레이션용 총 27차시 (천재국어 중3 2학기 전 차시)

  return students.map(student => {
    const profile = STUDENT_PROFILES[student.id] || 'normal';
    const lessonsData: { [lessonGlobalIndex: number]: { [fieldId: string]: number } } = {};

    for (let globalIdx = 1; globalIdx <= totalLessonsCount; globalIdx++) {
      const dataForLesson: { [fieldId: string]: number } = {};
      XAPI_FIELDS.forEach(field => {
        dataForLesson[field.id] = generateFieldVal(profile, field.id, globalIdx, totalLessonsCount);
      });
      lessonsData[globalIdx] = dataForLesson;
    }

    return {
      studentId: student.id,
      studentName: student.name,
      lessonsData
    };
  });
};

// 초기 시뮬레이션용 학생 xAPI 데이터 셋
export const MOCK_LRS_DATA = generateMockLrsData();

// 임의의 학생 명단을 받아 LRS 시뮬레이션 데이터를 생성 (학급별 데이터에 사용)
const SAMPLE_PROFILES: Array<'top' | 'normal' | 'improving' | 'dropping' | 'unengaged'> = [
  'top',
  'normal',
  'normal',
  'improving',
  'dropping',
  'normal',
  'top',
  'unengaged',
  'normal',
  'normal',
  'improving',
  'dropping',
  'normal',
  'normal',
  'top',
  'normal',
  'unengaged',
  'normal',
  'normal',
  'dropping',
  'normal',
  'normal',
  'top',
  'normal',
  'normal',
];

export function generateLrsForStudents(
  students: { id: string; name: string }[],
  totalLessons = 27,
): StudentXApiData[] {
  return students.map((student, idx) => {
    const profile = SAMPLE_PROFILES[idx % SAMPLE_PROFILES.length];
    const lessonsData: { [k: number]: { [k: string]: number } } = {};
    for (let g = 1; g <= totalLessons; g++) {
      const point: { [k: string]: number } = {};
      XAPI_FIELDS.forEach((f) => {
        point[f.id] = generateFieldVal(profile, f.id, g, totalLessons);
      });
      lessonsData[g] = point;
    }
    return {
      studentId: student.id,
      studentName: student.name,
      lessonsData,
    };
  });
}

// 5. 천재교과서(노미숙) 국어 중3 2학기 기본 차시별 실제 상세 세팅 데이터
export const PRECONFIGURED_LESSONS: Lesson[] = [
  // 1단원. 문학과 삶
  {
    id: 'lesson_unit_1_subunit_1_1_1',
    subunitId: 'subunit_1_1',
    unitId: 'unit_1',
    index: 1,
    globalIndex: 1,
    learningObjective: "노랫말 '보물'에 반영된 정서를 파악하고, 오늘날 우리의 삶 속의 보물과 연계 감상하기",
    achievementStandards: ['9국05-06'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['개념 이해']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_1_subunit_1_1_2',
    subunitId: 'subunit_1_1',
    unitId: 'unit_1',
    index: 2,
    globalIndex: 2,
    learningObjective: "고시조 '까마귀 눈비 맞아'의 역사적 사회·문화적 배경(단종 폐위와 계유정난) 이해하기",
    achievementStandards: ['9국05-05'],
    activityTypes: {
      participation: ['짝 학습'],
      goal: ['개념 학습'],
      format: ['개념 이해', '탐구']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_1_subunit_1_1_3',
    subunitId: 'subunit_1_1',
    unitId: 'unit_1',
    index: 3,
    globalIndex: 3,
    learningObjective: "현대시 '들판이 적막하다'의 생태학적 시어 감상 및 성찰 감상문 쓰기",
    achievementStandards: ['9국05-06'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['적용 학습'],
      format: ['토의', '글쓰기']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_1_subunit_1_2_1',
    subunitId: 'subunit_1_2',
    unitId: 'unit_1',
    index: 1,
    globalIndex: 4,
    learningObjective: "현대 소설 '꺼삐딴 리'의 시대적 배경(일제강점기~해방정국)의 연표 구성 및 특징 분석",
    achievementStandards: ['9국05-05'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['개념 이해']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_1_subunit_1_2_2',
    subunitId: 'subunit_1_2',
    unitId: 'unit_1',
    index: 2,
    globalIndex: 5,
    learningObjective: "주인공 '이인국 박사'의 기회주의적 가치관에 대한 찬반 찬반 토론 및 에세이 제출",
    achievementStandards: ['9국05-05', '9국05-06'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['문제해결 학습'],
      format: ['토론', '글쓰기']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_1_subunit_1_2_3',
    subunitId: 'subunit_1_2',
    unitId: 'unit_1',
    index: 3,
    globalIndex: 6,
    learningObjective: "'꺼삐딴 리' 소설의 주제 의식 및 사회적 배경과 인물 성향 분석 종합 퀴즈 풀기",
    achievementStandards: ['9국05-05'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['퀴즈']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_1_subunit_1_extra_1',
    subunitId: 'subunit_1_extra',
    unitId: 'unit_1',
    index: 1,
    globalIndex: 7,
    learningObjective: "시나리오 '세 얼간이' 갈등 양상 파악 및 진정한 교육 제도와 자아 실현에 관해 발표하기",
    achievementStandards: ['9국05-06'],
    activityTypes: {
      participation: ['학급 전체 학습'],
      goal: ['적용 학습'],
      format: ['발표', '개념 이해']
    },
    customIndicators: []
  },
  // 2단원. 논증과 설득 전략
  {
    id: 'lesson_unit_2_subunit_2_1_1',
    subunitId: 'subunit_2_1',
    unitId: 'unit_2',
    index: 1,
    globalIndex: 8,
    learningObjective: "논증의 구성 원리(명제와 논거) 및 귀납, 연역, 유추 논증 구분 형성평가 퀴즈",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['퀴즈']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_2_subunit_2_1_2',
    subunitId: 'subunit_2_1',
    unitId: 'unit_2',
    index: 2,
    globalIndex: 9,
    learningObjective: "'왜 속도를 고민해야 하는가?' 본문에 적용된 귀납 및 연역적 논증 타당성 평가 분석",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['적용 학습'],
      format: ['개념 이해', '탐구']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_2_subunit_2_1_3',
    subunitId: 'subunit_2_1',
    unitId: 'unit_2',
    index: 3,
    globalIndex: 10,
    learningObjective: "이규보 '이옥설'의 유추적 설(說) 양식 분석 및 일상적 유추 사례 모둠 토의",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['문제해결 학습'],
      format: ['토의']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_2_subunit_2_2_1',
    subunitId: 'subunit_2_2',
    unitId: 'unit_2',
    index: 1,
    globalIndex: 11,
    learningObjective: "킹 목사 연설 '나에게는 꿈이 있습니다' 속 설득 전략(이성, 감성, 인격적 전략) 구분하기",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['개념 이해']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_2_subunit_2_2_2',
    subunitId: 'subunit_2_2',
    unitId: 'unit_2',
    index: 2,
    globalIndex: 12,
    learningObjective: "해양환경공단 '바다를 지켜 주세요' 광고의 매체적 설득 효과 비판적 분석 및 모둠 토의",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['적용 학습'],
      format: ['토의']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_2_subunit_2_2_3',
    subunitId: 'subunit_2_2',
    unitId: 'unit_2',
    index: 3,
    globalIndex: 13,
    learningObjective: "설득 전략의 비판적 분석 기준 이해 및 종합 형성 평가 퀴즈 풀이",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['퀴즈']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_2_subunit_2_extra_1',
    subunitId: 'subunit_2_extra',
    unitId: 'unit_2',
    index: 1,
    globalIndex: 14,
    learningObjective: "설명문 '논증의 오류'에 제시된 일상 속 논리적 오류 유형 조사 및 발표",
    achievementStandards: ['9국02-05'],
    activityTypes: {
      participation: ['짝 학습'],
      goal: ['문제해결 학습'],
      format: ['발표', '탐구']
    },
    customIndicators: []
  },
  // 3단원. 문장과 글쓰기
  {
    id: 'lesson_unit_3_subunit_3_1_1',
    subunitId: 'subunit_3_1',
    unitId: 'unit_3',
    index: 1,
    globalIndex: 15,
    learningObjective: "홑문장과 겹문장(안은문장, 이어진문장)의 차이점 및 개념 구분 퀴즈",
    achievementStandards: ['9국04-06'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['퀴즈']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_3_subunit_3_1_2',
    subunitId: 'subunit_3_1',
    unitId: 'unit_3',
    index: 2,
    globalIndex: 16,
    learningObjective: "안은문장(명사절, 관형절, 부사절, 서술절, 인용절)의 구체적인 짜임 문법 구조 탐구",
    achievementStandards: ['9국04-06'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['적용 학습'],
      format: ['개념 이해', '탐구']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_3_subunit_3_1_3',
    subunitId: 'subunit_3_1',
    unitId: 'unit_3',
    index: 3,
    globalIndex: 17,
    learningObjective: "겹문장의 바람직한 표현 효과 탐구 및 정확한 문장 고쳐 쓰기 창작 활동",
    achievementStandards: ['9국04-06'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['문제해결 학습'],
      format: ['창작']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_3_subunit_3_2_1',
    subunitId: 'subunit_3_2',
    unitId: 'unit_3',
    index: 1,
    globalIndex: 18,
    learningObjective: "글쓰기 윤리(표절 금지, 출처의 정확한 밝히기) 규칙 탐구 및 만화 사례 분석",
    achievementStandards: ['9국03-10'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['개념 이해']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_3_subunit_3_2_2',
    subunitId: 'subunit_3_2',
    unitId: 'unit_3',
    index: 2,
    globalIndex: 19,
    learningObjective: "우리 학교 학생들의 스마트폰 사용 실태 조사를 위한 설문 계획 수립 및 실태조사",
    achievementStandards: ['9국03-03'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['적용 학습'],
      format: ['탐구']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_3_subunit_3_2_3',
    subunitId: 'subunit_3_2',
    unitId: 'unit_3',
    index: 3,
    globalIndex: 20,
    learningObjective: "쓰기 윤리를 준수하여 설문 조사 분석 자료와 도표가 포함된 모둠 조사 보고서 최종 작성",
    achievementStandards: ['9국03-10', '9국03-03'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['문제해결 학습'],
      format: ['글쓰기']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_3_subunit_3_extra_1',
    subunitId: 'subunit_3_extra',
    unitId: 'unit_3',
    index: 1,
    globalIndex: 21,
    learningObjective: "출처 인용 규정(직접/간접 인용)의 실제 적용 문제 풀이 퀴즈",
    achievementStandards: ['9국03-10'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['퀴즈']
    },
    customIndicators: []
  },
  // 4단원. 점검과 조정
  {
    id: 'lesson_unit_4_subunit_4_1_1',
    subunitId: 'subunit_4_1',
    unitId: 'unit_4',
    index: 1,
    globalIndex: 22,
    learningObjective: "독서의 메타인지 읽기 과정 점검 및 조정 전략(질문하기, 다시 읽기 등) 원리 학습",
    achievementStandards: ['9국02-09'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['개념 이해']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_4_subunit_4_1_2',
    subunitId: 'subunit_4_1',
    unitId: 'unit_4',
    index: 2,
    globalIndex: 23,
    learningObjective: "오주석 '절로 뛰어들게 만드는 씨름판의 풍경' 감상 및 독서 과정 상호 점검 짝 평가",
    achievementStandards: ['9국02-09'],
    activityTypes: {
      participation: ['짝 학습'],
      goal: ['적용 학습'],
      format: ['탐구']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_4_subunit_4_1_3',
    subunitId: 'subunit_4_1',
    unitId: 'unit_4',
    index: 3,
    globalIndex: 24,
    learningObjective: "한진수 '많이 만들수록 줄어드는 생산비의 비밀' 독해 점검 기록 및 퀴즈 풀이",
    achievementStandards: ['9국02-09'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['적용 학습'],
      format: ['퀴즈']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_4_subunit_4_2_1',
    subunitId: 'subunit_4_2',
    unitId: 'unit_4',
    index: 1,
    globalIndex: 25,
    learningObjective: "말하기 불안 증상의 원인 고찰 및 발표 청중 분석(요구, 지식 수준) 전략 수립",
    achievementStandards: ['9국01-06', '9국01-07'],
    activityTypes: {
      participation: ['개인학습'],
      goal: ['개념 학습'],
      format: ['개념 이해']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_4_subunit_4_2_2',
    subunitId: 'subunit_4_2',
    unitId: 'unit_4',
    index: 2,
    globalIndex: 26,
    learningObjective: "청중 분석을 바탕으로 1분 스피치 말하기 실습 및 상호 평가 발표회 진행",
    achievementStandards: ['9국01-06', '9국01-07'],
    activityTypes: {
      participation: ['학급 전체 학습'],
      goal: ['적용 학습'],
      format: ['발표']
    },
    customIndicators: []
  },
  {
    id: 'lesson_unit_4_subunit_4_extra_1',
    subunitId: 'subunit_4_extra',
    unitId: 'unit_4',
    index: 1,
    globalIndex: 27,
    learningObjective: "동화 '발표하기 무서워요!' 감상 및 모둠 극복 경험 나누기 토의 및 일기 글쓰기",
    achievementStandards: ['9국01-07'],
    activityTypes: {
      participation: ['모둠 학습'],
      goal: ['문제해결 학습'],
      format: ['토의', '글쓰기']
    },
    customIndicators: []
  }
];

// =====================================================
// 6. 교사 프로필 + 다중 학급 샘플 데이터
// =====================================================
export const INITIAL_TEACHER_PROFILE: TeacherProfile = {
  name: '홍길동',
  email: 'honggildong@sen.go.kr',
  schoolLevel: '중학교',
  schoolName: 'OO중학교',
  subject: '국어',
  semester: '2026학년도 1학기',
};

// 학급별 학생 명단을 살짝 다르게 생성하는 헬퍼
function sliceStudents(start: number, count: number): Student[] {
  return INITIAL_STUDENTS.slice(start, start + count).map((s, i) => ({
    id: `${s.id}_${start}_${i}`,
    name: s.name,
  }));
}

const CHEONJAE_SCHEDULE_1: ClassSchedule[] = [
  { day: '월', period: 2 },
  { day: '수', period: 3 },
  { day: '금', period: 5 },
];
const CHEONJAE_SCHEDULE_2: ClassSchedule[] = [
  { day: '화', period: 1 },
  { day: '목', period: 4 },
  { day: '금', period: 2 },
];
const MIRAEN_SCHEDULE: ClassSchedule[] = [
  { day: '월', period: 4 },
  { day: '수', period: 5 },
  { day: '목', period: 6 },
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'class_3_1',
    grade: '3학년',
    classNumber: '1반',
    publisher: '천재교과서(노미숙)',
    students: sliceStudents(0, 25),
    schedule: CHEONJAE_SCHEDULE_1,
    units: JSON.parse(JSON.stringify(DEFAULT_UNITS)),
    lessons: JSON.parse(JSON.stringify(PRECONFIGURED_LESSONS)),
    currentLessonGlobalIndex: 12,
  },
  {
    id: 'class_3_2',
    grade: '3학년',
    classNumber: '2반',
    publisher: '천재교과서(노미숙)',
    students: sliceStudents(0, 24),
    schedule: CHEONJAE_SCHEDULE_2,
    units: JSON.parse(JSON.stringify(DEFAULT_UNITS)),
    lessons: JSON.parse(JSON.stringify(PRECONFIGURED_LESSONS)),
    currentLessonGlobalIndex: 11,
  },
  {
    id: 'class_2_4',
    grade: '2학년',
    classNumber: '4반',
    publisher: '천재교과서(노미숙)',
    students: sliceStudents(0, 23),
    schedule: MIRAEN_SCHEDULE,
    units: JSON.parse(JSON.stringify(DEFAULT_UNITS)),
    lessons: JSON.parse(JSON.stringify(PRECONFIGURED_LESSONS)),
    currentLessonGlobalIndex: 4,
  },
];

// 한국 요일 표기와 Date.getDay() 매핑 (월=1, 일=0)
const KOREAN_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function getTodayKoreanDay(): string {
  return KOREAN_DAYS[new Date().getDay()];
}

// 오늘 시간표에 있는 학급의 다음 진행 차시 정보를 계산
export function getTodaysLessonForClass(c: ClassRoom): {
  hasClassToday: boolean;
  period?: number;
  upcomingLesson?: Lesson;
} {
  const today = getTodayKoreanDay();
  const slot = c.schedule.find((s) => s.day === today);
  if (!slot) {
    // 오늘 수업이 없으면 그 다음 차시만 표시
    const upcoming = c.lessons.find((l) => l.globalIndex === c.currentLessonGlobalIndex);
    return { hasClassToday: false, upcomingLesson: upcoming };
  }
  const upcoming = c.lessons.find((l) => l.globalIndex === c.currentLessonGlobalIndex);
  return { hasClassToday: true, period: slot.period, upcomingLesson: upcoming };
}

export function formatSchedule(schedule: ClassSchedule[]): string {
  return schedule.map((s) => `${s.day} ${s.period}교시`).join(' · ');
}

// ─── 차시 번호: 대단원별로 1차시부터 재시작 ───
export function getUnitLessonNumber(lesson: Lesson, lessons: Lesson[]): number {
  const ordered = lessons
    .filter((l) => l.unitId === lesson.unitId)
    .sort((a, b) => a.globalIndex - b.globalIndex);
  const idx = ordered.findIndex((l) => l.id === lesson.id);
  return idx + 1; // 1-based
}

export function getUnitNumberForLesson(lesson: Lesson, units: Unit[]): number {
  return units.find((u) => u.id === lesson.unitId)?.number ?? 0;
}

export function formatLessonLabel(
  lesson: Lesson,
  units: Unit[],
  lessons: Lesson[],
): string {
  const u = getUnitNumberForLesson(lesson, units);
  const n = getUnitLessonNumber(lesson, lessons);
  return `${u}단원 ${n}차시`;
}

// ─── 학기 기간 / 예상 진도 ───
// 한국 학사 일정 기준 단순 모형: 1학기 3/2 ~ 7/14, 2학기 8/25 ~ 12/22
export function getSemesterBounds(semester: string): { start: Date; end: Date } {
  const yearMatch = semester.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
  const is2nd = semester.includes('2학기');
  if (is2nd) {
    return { start: new Date(year, 7, 25), end: new Date(year, 11, 22) }; // 8/25 ~ 12/22
  }
  return { start: new Date(year, 2, 2), end: new Date(year, 6, 14) }; // 3/2 ~ 7/14
}

// 예상 진도(차시) 하드코딩 — 현재 14차시 정도 진행되어야 한다고 가정
const EXPECTED_COMPLETED_LESSONS = 14;

export function getExpectedCompletedLessons(
  totalLessons: number,
  _semester?: string,
  _today?: Date,
): number {
  return Math.min(EXPECTED_COMPLETED_LESSONS, totalLessons);
}

