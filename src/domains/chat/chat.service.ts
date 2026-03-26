/**
 * Chat 서비스
 *
 * Claude API (Tool Use)를 활용한 AI 챗봇 비즈니스 로직
 *
 * [흐름]
 * 1. 사용자 메시지를 Claude API에 전달
 * 2. Claude가 도구 호출(tool_use)을 결정하면 해당 도구 실행
 *    - create_event: 기존 event.service의 writeEvent() 호출하여 일정 생성
 *    - get_events:   기존 event.service의 getEventList() 호출하여 일정 조회
 *    - get_courts:   기존 court.service의 getCourtList() 호출하여 코트 조회
 * 3. 도구 실행 결과를 Claude에 다시 전달하여 최종 응답 생성
 * 4. SSE(Server-Sent Events) 스트림으로 프론트엔드에 실시간 전송
 *
 * [SSE 이벤트 타입]
 * - text:       Claude의 텍스트 응답
 * - tool_start: 도구 실행 시작 (프론트에서 로딩 표시용)
 * - tool_end:   도구 실행 완료
 * - done:       전체 응답 완료
 * - error:      오류 발생
 */

import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import type {
  ChatMessage,
  CreateEventToolParams,
  GetEventsToolParams,
  GetCourtsToolParams,
} from './chat.model'
import { chatTools } from './chat.tools'
import { writeEvent, getEventList } from '@/domains/event'
import { getCourtList } from '@/domains/court'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** Claude에게 전달하는 시스템 프롬프트 (역할, 규칙 정의) */
const SYSTEM_PROMPT = `당신은 "이름없는 테니스 모임(이테모)"의 AI 어시스턴트입니다.
테니스 동호회 회원들의 일정 관리를 도와주는 역할입니다.

주요 규칙:
- 현재 날짜/시간 기준: 한국 시간(KST, UTC+9)
- 일정 생성 시 사용자가 년,월을 말하지 않으면 현재 날짜 기준
- 일정 생성 시 사용자가 종료 시간을 말하지 않으면 시작 시간 + 2시간으로 설정
- 일정 생성 시 사용자가 최대 인원을 말하지 않으면 4명으로 설정
- 일정 생성 시 사용자가 제목을 말하지 않으면 장소명 + "테니스" 형태로 설정 (예: "고양체육관 테니스")
- 코트 목록에 있는 장소명과 사용자가 말한 장소를 매칭하여 location_name과 location_url을 설정
- 사용자가 코트 목록, 장소 정보, 테니스장 등을 물어보면 get_courts 도구로 조회하여 이름, 주소, 실내/실외 여부 등을 안내
- 친근하고 간결하게 응답하세요. 한국어로 대화합니다.
- 일정 생성 완료 후에는 생성된 일정의 요약 정보를 보여주세요.
- 회칙/공지/규정/예약/우천취소/게스트 정책 등 문서 기반 질문은 먼저 search_docs 도구로 근거를 찾고 답하세요.
- search_docs 결과(hits)가 비어있거나 근거가 약하면 "문서에서 확인되지 않는다"라고 말하고 운영진에게 문의를 안내하세요.
- 답변에는 근거 문서 제목을 짧게 같이 표시하세요.`

/**
 * Claude가 요청한 도구를 실행하고 결과를 JSON 문자열로 반환
 * 기존 서비스 레이어(event, court)를 직접 호출하여 DB 작업 수행
 */
async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  hostMemberSeq: number,
): Promise<string> {
  switch (toolName) {
    // 일정 생성: writeEvent() 호출 → DB에 이벤트 INSERT
    case 'create_event': {
      const params = toolInput as unknown as CreateEventToolParams
      const event = await writeEvent({
        title: params.title,
        start_datetime: params.start_datetime,
        end_datetime: params.end_datetime,
        location_name: params.location_name ?? null,
        location_url: params.location_url ?? null,
        max_participants: params.max_participants,
        description: params.description ?? null,
        host_member_seq: hostMemberSeq,
      })
      return JSON.stringify({
        success: true,
        event_id: event.id,
        title: event.title,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        location_name: event.location_name,
        max_participants: event.max_participants,
      })
    }

    // 일정 조회: getEventList() 호출 → 특정 월의 이벤트 목록 반환
    case 'get_events': {
      const params = toolInput as unknown as GetEventsToolParams
      const result = await getEventList(1, 50, {
        year: params.year,
        month: params.month,
      })
      return JSON.stringify({
        total: result.total,
        events: result.events.map((e) => ({
          id: e.id,
          title: e.title,
          start_datetime: e.start_datetime,
          end_datetime: e.end_datetime,
          location_name: e.location_name,
          max_participants: e.max_participants,
          current_participants: e.current_participants,
          host_nickname: e.host_nickname,
        })),
      })
    }

    // 코트 조회: getCourtList() 호출 → 등록된 테니스 코트 목록 반환
    case 'get_courts': {
      const params = toolInput as unknown as GetCourtsToolParams
      const result = await getCourtList(params.page ?? 1, params.limit ?? 20)
      return JSON.stringify({
        total: result.total,
        courts: result.courts.map((c) => ({
          court_id: c.court_id,
          name: c.name,
          address: c.address,
          is_indoor: c.is_indoor,
          court_type: c.court_type,
          rsv_url: c.rsv_url,
        })),
      })
    }
    case 'search_docs': {
      const { query } = toolInput as { query: string; top_k?: number }
      return JSON.stringify({
        query,
        hits: [],
        message: '문서 검색 기능이 아직 준비되지 않았습니다. 운영진에게 문의해 주세요.',
      })
    }

    default:
      return JSON.stringify({ error: `알 수 없는 도구: ${toolName}` })
  }
}

/**
 * 챗봇 메시지를 처리하고 SSE 스트림으로 반환
 *
 * Tool Use 루프: Claude가 도구 호출을 요청하면 실행 → 결과 전달 → 재호출
 * 이를 통해 "일정 만들어줘" 같은 자연어 명령을 실제 DB 작업으로 변환
 *
 * @param messages   - 사용자와 AI의 대화 이력
 * @param hostMemberSeq - 로그인한 회원의 seq (일정 생성 시 주최자로 설정)
 * @returns SSE 형식의 ReadableStream
 */
export async function processChatStream(
  messages: ChatMessage[],
  hostMemberSeq: number,
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        // 프론트엔드 메시지를 Anthropic API 형식으로 변환
        const anthropicMessages: Anthropic.MessageParam[] = messages.map(
          (m) => ({
            role: m.role,
            content: m.content,
          }),
        )

        let continueLoop = true

        // Tool Use 루프: Claude가 도구를 호출하는 한 계속 반복
        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: chatTools,
            messages: anthropicMessages,
          })

          if (response.stop_reason === 'tool_use') {
            // Claude가 도구 호출을 요청한 경우
            // 도구 호출 전 텍스트가 있으면 먼저 전송
            for (const block of response.content) {
              if (block.type === 'text' && block.text) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'text',
                      content: block.text,
                    })}\n\n`,
                  ),
                )
              }
            }

            // assistant 메시지는 한 번만 추가 (tool_use 블록이 여러 개여도 동일)
            anthropicMessages.push({
              role: 'assistant',
              content: response.content,
            })

            // 모든 tool_use 블록을 실행하고 결과를 한 번에 모아서 전달
            const toolResults: Anthropic.ToolResultBlockParam[] = []
            for (const block of response.content) {
              if (block.type === 'tool_use') {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'tool_start',
                      tool: block.name,
                    })}\n\n`,
                  ),
                )

                const toolResult = await executeToolCall(
                  block.name,
                  block.input as Record<string, unknown>,
                  hostMemberSeq,
                )

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'tool_end',
                      tool: block.name,
                    })}\n\n`,
                  ),
                )

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: toolResult,
                })
              }
            }

            // tool_result 메시지도 한 번에 추가
            anthropicMessages.push({
              role: 'user',
              content: toolResults,
            })
          } else {
            // 최종 텍스트 응답 (도구 호출 없음)
            for (const block of response.content) {
              if (block.type === 'text') {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'text',
                      content: block.text,
                    })}\n\n`,
                  ),
                )
              }
            }
            continueLoop = false
          }
        }

        // 스트림 종료 신호
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
        )
        controller.close()
      } catch (error) {
        console.error('챗봇 처리 에러:', error)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              content: '처리 중 오류가 발생했습니다.',
            })}\n\n`,
          ),
        )
        controller.close()
      }
    },
  })
}
