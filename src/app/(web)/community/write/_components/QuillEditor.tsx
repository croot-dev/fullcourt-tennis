'use client'

import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

interface QuillEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)

  // onChange ref를 최신 상태로 유지
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // 변경 이벤트 핸들러 - ref를 통해 항상 최신 onChange 호출
  const handleTextChange = () => {
    if (!quillRef.current) return
    const content = quillRef.current.root.innerHTML
    onChangeRef.current?.(content)
  }

  useEffect(() => {
    if (!editorRef.current) return
    if (!quillRef.current) {
      // Quill 인스턴스 생성
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
          ],
        },
      })
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
    </div>
  )
}
