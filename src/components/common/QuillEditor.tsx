'use client'

import { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { Delta, type Range } from 'quill/core'
import 'quill/dist/quill.snow.css'
import BlotFormatter from '@enzedonline/quill-blot-formatter2'
import { isImageUrl } from '@/domains/image/image.model'
import { uploadPostImage, UPLOADABLE_IMAGE_TYPES } from '@/lib/image.client'

Quill.register('modules/blotFormatter2', BlotFormatter)

// 이미지 크기 조절만 사용 (정렬/링크/alt 편집은 sanitize 허용 범위 밖의 마크업을 만들어 비활성화)
// 에디터와 상세 페이지 폭이 달라 % 단위로 저장
const IMAGE_RESIZE_OPTIONS = {
  align: { allowAligning: false },
  resize: { useRelativeSize: true, allowResizeModeChange: false },
  image: {
    allowAltTitleEdit: false,
    registerImageTitleBlot: false,
    allowCompressor: false,
    linkOptions: { allowLinkEdit: false },
  },
}

interface QuillEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  /** 익명 게시판 여부 (이미지 업로더 정보를 남기지 않음) */
  isAnonymous?: boolean
  /** 이미지 업로드 진행 여부 변경 시 호출 (업로드 중 제출 방지용) */
  onUploadingChange?: (isUploading: boolean) => void
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  isAnonymous = false,
  onUploadingChange,
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)
  const isAnonymousRef = useRef(isAnonymous)
  const [uploadingCount, setUploadingCount] = useState(0)
  const isUploading = uploadingCount > 0

  // onChange ref를 최신 상태로 유지
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    isAnonymousRef.current = isAnonymous
  }, [isAnonymous])

  useEffect(() => {
    onUploadingChange?.(isUploading)
  }, [isUploading, onUploadingChange])

  // 변경 이벤트 핸들러 - ref를 통해 항상 최신 onChange 호출
  const handleTextChange = () => {
    if (!quillRef.current) return
    const content = quillRef.current.root.innerHTML
    onChangeRef.current?.(content)
  }

  // 이미지 업로드 후 선택 위치에 순서대로 삽입 (툴바/붙여넣기/드롭 공통)
  const handleImageUpload = async (range: Range, files: File[]) => {
    const quill = quillRef.current
    if (!quill) return

    setUploadingCount((count) => count + files.length)
    let index = range.index
    try {
      for (const file of files) {
        const { url } = await uploadPostImage(file, isAnonymousRef.current)
        quill.insertEmbed(index, 'image', url, 'user')
        index += 1
        setUploadingCount((count) => count - 1)
      }
      quill.setSelection(index, 0, 'silent')
    } catch (error) {
      console.error('이미지 업로드 에러:', error)
      alert(
        error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      )
    } finally {
      setUploadingCount(0)
    }
  }

  const openImagePicker = () => {
    const quill = quillRef.current
    if (!quill) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = UPLOADABLE_IMAGE_TYPES.join(',')
    input.multiple = true
    input.onchange = () => {
      if (!input.files?.length) return
      quill.uploader.upload(quill.getSelection(true), input.files)
    }
    input.click()
  }

  useEffect(() => {
    if (!editorRef.current) return
    if (!quillRef.current) {
      // Quill 인스턴스 생성
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ['link', 'image'],
              ['clean'],
            ],
            handlers: { image: openImagePicker },
          },
          // 기본 동작(base64 삽입) 대신 서버 업로드
          uploader: {
            mimetypes: UPLOADABLE_IMAGE_TYPES,
            handler: handleImageUpload,
          },
          blotFormatter2: IMAGE_RESIZE_OPTIONS,
        },
      })

      // 다른 사이트에서 복사한 외부/base64 이미지는 서버에서 제거되므로 붙여넣기 단계에서 제외
      quill.clipboard.addMatcher('IMG', (node, delta) =>
        isImageUrl((node as HTMLImageElement).getAttribute('src') ?? '')
          ? delta
          : new Delta()
      )

      quillRef.current = quill
    }

    quillRef.current.on('text-change', handleTextChange)

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change', handleTextChange)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 빈 배열: 마운트 시 한 번만 실행

  // 초기값 설정 (Quill 인스턴스가 생성된 후)
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML
      // 초기 렌더링 시에만 설정 (빈 에디터일 때)
      if (currentContent === '<p><br></p>' && value) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value)
      }
    }
  }, [value])

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={editorRef}
        style={{ minHeight: '300px', backgroundColor: 'white' }}
      />
      {isUploading && (
        <p
          role="status"
          style={{ marginTop: '8px', fontSize: '14px', color: '#4a5568' }}
        >
          이미지 {uploadingCount}장 업로드 중...
        </p>
      )}
    </div>
  )
}
