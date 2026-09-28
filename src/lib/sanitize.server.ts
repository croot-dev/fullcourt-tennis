/**
 * 게시글 HTML sanitize
 * Quill 에디터가 생성하는 태그/속성만 허용하고 나머지는 제거
 * - img: 자체 이미지 저장소(/api/images/*) 경로만 허용 (외부 URL, base64 차단)
 * - a: http/https/mailto 만 허용
 */

import 'server-only'
import sanitizeHtml from 'sanitize-html'
import { isImageUrl } from '@/domains/image/image.model'

const CSS_COLOR = [
  /^#[0-9a-f]{3,6}$/i,
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/i,
]

const POST_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h1', 'h2', 'h3', 'strong', 'em', 'u', 's',
    'ol', 'ul', 'li', 'a', 'img', 'span', 'blockquote', 'pre', 'code',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    li: ['data-list'],
    span: ['style', 'class', 'contenteditable'],
    '*': ['class'],
  },
  allowedClasses: {
    '*': ['ql-align-*', 'ql-indent-*', 'ql-ui'],
  },
  allowedStyles: {
    span: { color: CSS_COLOR, 'background-color': CSS_COLOR },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: [] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  },
  exclusiveFilter: (frame) =>
    frame.tag === 'img' && !isImageUrl(frame.attribs.src ?? ''),
}

export function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, POST_SANITIZE_OPTIONS)
}
