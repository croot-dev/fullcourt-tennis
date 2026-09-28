-- 게시글 소프트 삭제 + 본문 이미지 추적
-- 실행: Neon 콘솔 SQL Editor (운영 브랜치 확인 후)
-- 여러 번 실행해도 안전하도록 IF NOT EXISTS 사용

BEGIN;

-- 1. 게시글 소프트 삭제
--    삭제 시 행을 지우지 않고 삭제 시각만 기록 (댓글 보존, 복구 가능)
ALTER TABLE bbs_post
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- 2. 게시글 본문 이미지 (Netlify Blobs 'post-images' 스토어의 키)
--    post_id IS NULL: 업로드됐지만 아직 게시글에 연결되지 않은 이미지 (작성 취소 / 본문에서 제거됨)
CREATE TABLE IF NOT EXISTS bbs_post_image (
  image_key     varchar(64) PRIMARY KEY,
  post_id       bigint REFERENCES bbs_post (post_id) ON DELETE SET NULL,
  uploader_seq  bigint NOT NULL,
  created_at    timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bbs_post_image_post_id
  ON bbs_post_image (post_id);

COMMIT;

-- 확인
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'bbs_post' AND column_name = 'deleted_at';
-- SELECT to_regclass('bbs_post_image');
