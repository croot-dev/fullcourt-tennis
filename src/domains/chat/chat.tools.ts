import type Anthropic from '@anthropic-ai/sdk'

export const chatTools: Anthropic.Tool[] = [
  {
    name: 'create_event',
    description:
      '테니스 동호회 일정(이벤트)을 생성합니다. 사용자가 일정 만들기를 요청하면 이 도구를 사용하세요. 날짜와 시간은 ISO 8601 형식으로 변환해야 합니다. 현재 연도는 2026년입니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: '일정 제목 (예: "정기 모임", "번개 모임")',
        },
        start_datetime: {
          type: 'string',
          description:
            '시작 일시 (ISO 8601 형식, 예: "2026-03-15T14:00:00+09:00")',
        },
        end_datetime: {
          type: 'string',
          description:
            '종료 일시 (ISO 8601 형식). 사용자가 명시하지 않으면 시작 시간 + 2시간으로 설정',
        },
        location_name: {
          type: 'string',
          description: '장소 이름 (예: "고양체육관")',
        },
        location_url: {
          type: 'string',
          description: '장소 URL (네이버 지도 등)',
        },
        max_participants: {
          type: 'number',
          description: '최대 참가 인원. 사용자가 명시하지 않으면 8로 설정',
        },
        description: {
          type: 'string',
          description: '일정 설명',
        },
      },
      required: ['title', 'start_datetime', 'end_datetime', 'max_participants'],
    },
  },
  {
    name: 'get_events',
    description:
      '특정 월의 테니스 동호회 일정 목록을 조회합니다. 사용자가 일정 확인, 이번 달/다음 달 일정 등을 물어보면 이 도구를 사용하세요.',
    input_schema: {
      type: 'object' as const,
      properties: {
        year: {
          type: 'number',
          description: '조회할 연도 (예: 2026)',
        },
        month: {
          type: 'number',
          description: '조회할 월 (1~12)',
        },
      },
      required: ['year', 'month'],
    },
  },
  {
    name: 'get_courts',
    description:
      '등록된 테니스 코트 목록을 조회합니다. 사용자가 코트 정보, 장소 목록 등을 물어보면 이 도구를 사용하세요.',
    input_schema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'number',
          description: '페이지 번호 (기본값: 1)',
        },
        limit: {
          type: 'number',
          description: '페이지당 항목 수 (기본값: 20)',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_docs',
    description:
      '동호회 문서(회칙/공지/규정/코트 이용 안내 등)에서 질문과 관련된 내용을 검색합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: '검색 질의' },
        top_k: { type: 'number', description: '반환 문서 개수(기본 5)' },
      },
      required: ['query'],
    },
  },
]
