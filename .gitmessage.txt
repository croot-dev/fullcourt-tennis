# Commit Message Template

기본 형식:

`<type>(<scope>): <subject>`

예시:

- `feat(auth): add kakao token refresh handler`
- `fix(schedule): prevent duplicate event creation`
- `refactor(member): split service validation logic`

규칙:

1. `type`은 아래 중 하나를 사용한다.
   - `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`
2. `scope`는 선택이지만, 가능한 변경 영역을 명확히 표기한다.
3. `subject`는 72자 이내, 명령형 현재시제로 작성한다.
4. 제목 끝에 마침표(`.`)를 붙이지 않는다.
5. 의미 없는 메시지(`update`, `fix bug`, `wip`)는 금지한다.
