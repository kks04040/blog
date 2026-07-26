---
title: "Claude Code 및 Codex 설정 변경으로 토큰을 절약하는 방법"
date: "2026-04-19"
description: "현명하게 설정해서 소중한 토큰을 아껴봅시다."
---

한국시간 4월 17일 금요일 새벽 [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)이 나왔습니다. 당연히 성능은 훨씬 좋아졌다고 주장하는데, 저는 토큰 사용량의 변화가 가장 눈에 띄었어요.

> Opus 4.7 is a direct upgrade to Opus 4.6, but two changes are worth planning for because they affect token usage. First, Opus 4.7 uses an updated tokenizer that improves how the model processes text. The tradeoff is that **the same input can map to more tokens—roughly 1.0–1.35×** depending on the content type. Second, Opus 4.7 thinks more at higher effort levels, particularly on later turns in agentic settings. This improves its reliability on hard problems, but it does mean it produces **more output tokens**.

Opus 4.7 과 함께 업데이트된 [클로드 프롬프팅 베스트 프랙티스](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#interactive-coding-products)에도 비슷한 이야기가 나옵니다.

> Claude Opus 4.7's token usage and behavior can differ between autonomous, asynchronous coding agents with a single user turn and interactive, synchronous coding agents with multiple user turns. Specifically, **it tends to use more tokens in interactive settings**, primarily because it reasons more after user turns. This can improve long-horizon coherence, instruction following, and coding capabilities in long, interactive coding sessions, **but also comes with more token usage**. To maximize both performance and token efficiency in coding products, we recommend using `xhigh` or `high` effort, adding autonomous features like an auto mode, and reducing the number of human interactions required from your users.

한편 3월쯤부터 클로드 코드가 [캐싱 TTL을 슬며시 1시간 → 5분으로 줄이면서](https://github.com/anthropics/claude-code/issues/46829) 토큰 효율이 급격히 떨어져 커뮤니티가 불타기도 했었죠. 실제로 Opus 4.7 로 [측정해보니 4.6의 거의 1.5배 가까이](https://news.hada.io/topic?id=28641) 토큰이 더 소모된다는 이야기도 있더군요. 아예 [클로드 코드 캐싱 효율에 대한 연구 저장소](https://github.com/cnighswonger/claude-code-cache-fix)도 있는 실정입니다.

저도 토큰 리밋에 자주 고통받는 처지라 이참에 제대로 조사해봤습니다. **"클로드 코드와 코덱스에서 설정값을 바꿈으로써 토큰 효율을 끌어올리는 방법이 있을까?"**에서 출발했는데 꽤 유의미한 결과를 얻었어요.

이하의 내용은 클로드 코드 공식문서(설정/환경변수/IDE), 코덱스 공식문서(설정/환경변수/MCP), 코덱스 소스코드 등을 바탕으로 합니다.

## 내 설정 상태 점검용 프롬프트

거두절미하고 내 코딩 에이전트 설정이 어떤지 점검하고 싶은 분들은 아래 프롬프트를 사용해보세요.

```
https://gist.github.com/spilist/c468cbf1ed0ffc91100f813aabdcd520?#file-token-efficiency-analysis-prompt-md 를 읽고 그대로 실행해줘
```

[코딩 에이전트 토큰 효율과 관련된 상태 점검용 프롬프트](https://gist.github.com/spilist/c468cbf1ed0ffc91100f813aabdcd520)

> 💡 미세팁: 위 gist에서 [https://code.claude.com/docs/en/settings.md](https://code.claude.com/docs/en/settings.md) 같은 링크를 썼는데요. Anthropic과 OpenAI의 웬만한 문서들은 뒤에 `.md` 를 붙이면 마크다운 형식으로 해당 페이지를 볼 수 있어서, 에이전트에게 그냥 링크를 넘기는 것보다 더 효율적입니다.

---

## 무엇이 실제로 토큰을 먹는가

조사 결과, 코딩 에이전트에서 토큰이 새는 경로는 대체로 세 가지였습니다.

1. 매 세션 또는 매 턴 자동으로 붙은 추가 텍스트
2. 대화 히스토리에 남은 너무 긴 툴 호출 출력
3. 검색, 커넥터, IDE 연동처럼 외부 연결로 인한 추가 호출

설정을 바꿈으로써 위 3개를 어떻게 줄일 수 있는지, 그 트레이드오프는 무엇인지 봅시다. 참고로 안 쓰는 MCP 서버/플러그인 끄기, 모델 및 리즈닝 정도 조절 등 기본적인 건 생략했습니다.

## 토큰 효율과 관련된 클로드 코드 설정 및 환경변수

> 💡 *최종 확인 버전:* *`*2.1.114*`*

### 1) `includeGitInstructions: false` (기본값: true)

이 설정에 대해서는 [지난 글](/disabling-git-instructions-in-claude-code)에 소개해뒀으니 이 글을 읽어보세요. 짧지만 효과는 무척 클 수 있습니다.

[AI 미세팁: 설정 한 줄로 클로드 코드 토큰 아끼기](https://www.stdy.blog/disabling-git-instructions-in-claude-code/)

### 2) `autoConnectIde: false` (기본값: false)

외부 터미널에서 실행했을 때 IDE에 자동 연결할 것인가를 결정합니다. 켜두면 [JetBrains](https://code.claude.com/docs/en/jetbrains), [VS Code](https://code.claude.com/docs/en/vs-code) 등으로부터 현재 열린 파일, 선택된 텍스트, 에러 등이 컨텍스트에 자동으로 주입되어 작업을 돕게 됩니다.

이런 사람들에게는 끄는 걸 추천합니다. (기본값은 false지만, 저는 예전에 IDE 위주로 일할 때 켜뒀더라고요)

- VS Code/JetBrains 안에서 "지금 선택한 부분" 같은 지시를 거의 안 한다
- 린트 에러, 타입 에러를 IDE가 아니라 CLI에서(또는 에이전트가 알아서) 확인한다
- 터미널 중심으로 작업한다

반대로 이런 사람들은 끄지 않는 게 낫습니다.

- 드래그로 선택해둔 상태에서 자주 대화한다
- IDE 진단을 보고 바로 수정시키는 흐름을 많이 쓴다
- 터미널에서 실행해도 IDE 문맥 연결을 유지하는 편이 훨씬 빠르다

### 3) `CLAUDE_CODE_GLOB_NO_IGNORE=false` (기본값: true)

`Glob` 은 Claude Code가 [파일을 패턴매칭으로 찾을 때 쓰는 도구](https://code.claude.com/docs/en/tools-reference#tools-reference)인데, 기본적으로는 `.gitignore` 에 등재된 파일도 다 나옵니다. 그래서 이 환경변수를 `false` 로 두면 모노리포처럼 `.gitignore` 로 제외되는 파일(`node_modules`, 빌드 산출물, 캐시 디렉터리 등)이 많은 프로젝트에서 효과가 커요. "한 번의 검색 결과가 너무 길어지는 것"과 "그 결과를 따라 불필요한 Read가 연쇄로 붙는 것"이 줄어들기 때문입니다.

당연히, `.gitignore` 에 있는 미추적 파일을 자주 만져야 한다면 불편할 수 있으니 본인 상황에 맞게 사용하시길 바랍니다.

참고로 `CLAUDE_CODE_GLOB_HIDDEN` 이라는 환경변수도 있는데 이건 `false` 로 해두면 `.` 으로 시작하는 파일과 디렉토리가 `Glob` 결과에서 안 나오게 됩니다. 이건 켰을 때 대부분 손해일 거라 (`.claude` 가 안 보임) 이런 게 있다, 정도만 소개드립니다.

### 4) 출력 상한 설정하기

각종 출력의 상한값을 환경변수로 조절하여, 큰 출력 한 번에 컨텍스트가 확 차는 걸 막을 수 있습니다. 일부는 기본값이 공개되지 않아서 비공식(클로드 코드 유출본)으로 확인된 값을 기재해놨어요. 즉 최신 버전과는 다를 수 있습니다.

- `BASH_MAX_OUTPUT_LENGTH`: bash 출력 최대 문자 수 (기본값: 비공식 30,000)
- `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS`: 파일 읽기 최대 토큰 수 (기본값: 비공식 25,000)
- `MAX_MCP_OUTPUT_TOKENS`: MCP 도구 출력 최대 토큰 수 (기본값: 25,000)

당연히 이 상한을 줄이면 트레이드오프가 있습니다. 일회성 초대형 출력을 막기 위한 수단 정도로 생각하세요.

- '정당하게' 큰 파일들 (DB 마이그레이션 파일, 레거시 단일 파일 모듈, 자동 생성 스키마 등) 도 페이징될 수 있습니다.
- 상한에 걸리면 클로드가 잘린 꼬리를 복구하려고 `tail`, `grep`, 재실행으로 보완하는 경향이 있습니다. 즉 새로운 툴 호출이 늘어나면서 오히려 토큰이 더 많이 쓰일 수 있습니다.
- 긴 출력의 "꼬리"는 대개 가장 중요한 부분입니다. 테스트 요약, 에러 요약, 가장 최신 스택트레이스 등. 이게 잘리면 오진 확률이 올라갑니다.

### 5) 짧고 간단한 작업, 또는 비대화형 모드를 위한 환경변수와 플래그들

MCP 정의, 스킬 정의, 툴 정의, 훅, 메모리, `CLAUDE.md`, 그리고 시스템 프롬프트까지. 클로드 코드에 처음부터 주입되는 컨텍스트는 결코 적지 않습니다. 가끔 너무 간단한 일(이걸 저기로 옮겨줘, 이 디렉토리를 저 디렉토리에 심링크 해줘)을 시킬 때는 이런 게 아깝게 느껴질 때가 있죠.

그리고 실제로 이 모든 걸 환경변수와 플래그로 제어하는 게 가능합니다. 이것들을 잘 활용하면 대화형 모드뿐 아니라 비대화형 모드로, 클로드를 프로그래머블하게 '워커'로 활용할 때 무척 유용합니다. 토큰을 아끼고, 초기 구동 속도와 응답 속도는 높이고, 불확정성을 줄이기 때문이죠.

**환경변수:**

- `ENABLE_CLAUDEAI_MCP_SERVERS=false`: MCP 서버를 끕니다.
- `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`: 자동 저장된 메모리가 로드되지 않게 합니다.
- `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1`: 글로벌/프로젝트 `CLAUDE.md` 를 무시합니다.
- `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS=1`: 빌트인 서브에이전트 및 스킬 정의를 시스템 프롬프트에서 제외합니다.

**플래그 (`claude` 뒤에 쓰기):**

- `--tools`: 네이티브 툴을 선택적으로 활성화합니다. `--tools ""` 면 전부 비활성화합니다. 정말 모델의 지능만 쓰는 워커에서는 다 꺼도 괜찮고, 대화형으로 간단한 작업 시킬 때는 다 끄면 아예 일을 못하니 `"Bash,Edit,Glob,Grep,Read,Write"` 처럼 필요한 것만 켜면 됩니다.
- `--strict-mcp-config`: CLI로 명시한 MCP 설정만 쓰고 전역 MCP 설정은 무시합니다. 워커마다 필요한 커넥터만 깔끔하게 주입할 수 있습니다.
- `--disable-slash-commands`: `/help`, `/clear` 같은 슬래시 커맨드 정의가 시스템 프롬프트에서 빠집니다.
- `--no-session-persistence`: 세션 저장/재개 경로를 쓰지 않습니다. 일회성 실행의 덩어리가 쌓이지 않습니다.
- `--exclude-dynamic-system-prompt-sections`: 머신/환경마다 바뀌는 섹션을 빼 프롬프트 캐시 재사용률을 끌어올립니다. 같은 워커를 많이 돌릴수록 효과가 큽니다.
- `--system-prompt`: 다 떠나서 클로드 시스템 프롬프트를 아예 교체해버릴 수도 있습니다.

그런데 이런 환경변수와 플래그를 매번 설정하는 건 귀찮잖아요. 그래서 저는 원할 때만 특정 환경변수와 플래그를 켜둔 모드로 클로드를 쓸 수 있게 `.zshrc` 에 alias를 만들어뒀어요. 대략 이런 식입니다. (코딩 에이전트에게 만들어달라고 해보세요)

```bash
alias ccb='ENABLE_CLAUDEAI_MCP_SERVERS=false CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 CLAUDE_CODE_DISABLE_CLAUDE_MDS=1 CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS=1 DISABLE_TELEMETRY=1 claude --tools "Bash,Edit,Glob,Grep,Read,Write" --disable-slash-commands --exclude-dynamic-system-prompt-sections'

alias ccby='ccb --dangerously-skip-permissions'
```

> 💡 `DISABLE_TELEMETRY=1`: 이 환경변수는 토큰 절약에 관련된 건 아닙니다. Anthropic 쪽으로 나가는 아웃바운드 트래픽(사용 통계, 에러 리포트, 업데이트 체크 등)을 꺼주는 설정인데 저는 항상 이렇게 꺼둡니다.

참고로 [모든 걸 다 간단히 비워버리는](https://code.claude.com/docs/en/headless#start-faster-with-bare-mode) 용도로 `CLAUDE_CODE_SIMPLE=1` 라는 환경변수도 있습니다. `claude --bare` 로도 실행되는데요. 아쉽게도 이건 Oauth 로그인이 유지되지 않아 대화형으로는 쓰기 너무 불편하고, 비대화형도 사실상 API Key를 통해서만 쓸 수 있습니다. 그래서 이렇게만 언급해둡니다. (`--bare`에서 oauth 로그인만 [유지해달라는 이슈](https://github.com/anthropics/claude-code/issues/38022)가 있지만 다른 이슈들처럼 묻힐 듯...)

### 6) 번외: `attribution` 비우기

Claude Code는 기본적으로 커밋과 PR에 [attribution](https://code.claude.com/docs/en/settings#attribution-settings)(Generated with / Co-authored by Claude Code)을 붙입니다. 무척 사소하지만, 저는 과거 git log를 읽게 하거나 PR을 읽게 하는 일이 많아서 이런 텍스트가 추가로 붙는 게 싫더군요. 그래서 이렇게 다 비워두면 간접적으로 쓰이는 토큰이 살짝 줄어듭니다.

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

다만 요즘은 오히려 "AI 생성 표시"를 커밋에 붙이는 게 팀 정책인 곳도 있더군요. 본인의 팀 정책을 확인해보고 끄시길 바랍니다.

## 토큰 효율과 관련된 코덱스 설정 및 환경변수

> 💡 *최종 확인 버전:* *`*0.121.0*`* *+ 해당 버전* [Codex Github 소스코드](https://github.com/openai/codex)

코덱스에서는 클로드보다 조절 가능한 레버가 훨씬 적은 편입니다. 그런데 체감상 코덱스는 클로드보다 토큰 여유가 훨씬 많아서, 솔직히 크게는 신경 안 쓰이긴 해요. 그래도 티끌 모아 태산이니까 조사한 걸 공유드립니다.

### 1) ChatGPT에 연결된 MCP(앱/커넥터) 끄기

이건 Codex CLI를 ChatGPT Oauth 로 쓰시는 분들에게 중요한 설정입니다. Codex에서는 기본적으로 아래 두 설정이 true로 되어 있는데요.

- `features.apps` : 켜져 있으면 ChatGPT에 연결된 앱/커넥터 정보가 `codex_apps` 게이트웨이를 타고 시스템 프롬프트에 주입됩니다.
- `apps._default.enabled`: 연결된 앱들이 기본적으로 모두 시스템 프롬프트에 주입되며 에이전트가 쓸 수 있게 됩니다.

즉 `features.apps` 를 false로 두면 ChatGPT에 설치해뒀던 앱들에 대한 정보가 시스템 프롬프트에서 사라져서 토큰이 절약될 뿐 아니라, 연결된 불필요한 MCP 호출도 안 하게 됩니다. `apps._default.enabled` 는 `features.apps` 를 꺼두면 사실상 no-op입니다만, 보험 삼아 넣어두는 게 좋겠죠.

단, 이걸 끈다고 우리가 일부러 Codex 에 연결해뒀던 MCP가 꺼지는 건 아닙니다. 그건 별도로 관리됩니다.

### 2) `web_search = "disabled"`

[Codex CLI features의 Web search 섹션](https://developers.openai.com/codex/cli/features#web-search)에 따르면 Codex에서는 웹 검색이 `cached` 모드로 기본 활성화되어 있습니다. 이는 OpenAI에서 캐싱해둔 페이지에서 정보를 가져오는 모드죠.

이 설정을 disabled 로 해두면 검색이 필요없는 간단한 작업이나 로컬 코드베이스에서의 작업(리팩토링, 테스트 수정 등)만으로 충분한 경우에 에이전트가 검색 툴 호출로 빠지는 걸 방지할 수 있습니다.

참고로 `--yolo` 같은 full access 모드에서는 `web_search` 기본값이 `live` 가 되어, 실제로 검색해오는 걸로 바뀝니다. 그리고 저는 로컬 작업에서도 근거있게 작업하고 싶을 때가 많아서 그냥 항상 검색을 활성화해두는 편입니다. (물론 disabled 로 명시해두면 yolo 에서도 검색은 안 됩니다)

### 3) 출력 상한 설정하기

클로드와 달리 유의미한 건 하나밖에 못 찾았습니다. `tool_output_token_limit` (기본값: 10,000)은 개별 툴 출력을 얼마나 많이 저장할 것인지를 결정합니다. 공식 기본값은 None이고, 실제로는 메타데이터 기본값인 10,000이 쓰입니다.

이는 클로드의 '출력 상한 설정'처럼 대용량 파일이나 대량 검색 결과 등 때문에 세션이 급팽창하는 문제를 직접적으로 해결할 수 있습니다. 당연히 트레이드오프도 동일합니다. (로그 후반부의 정보를 잃는다, 모델이 다시 호출할 수 있다 등)

### 4) 비대화형 모드에서 잘 돌게 만드는 플래그들

`claude -p` 와 마찬가지로 `codex exec` 로 코덱스를 비대화형으로 켤 수 있습니다. 여기서 토큰 효율 및 속도, 안정성 관점에서 쓸만한 플래그를 몇 개 공유드립니다.

- `--profile`: 특정 설정(`web_search = "disabled"`, `tool_output_token_limit = 2000` 등)을 묶어두고 선택 적용 가능
- `--json` + `--output-last-message FILE` : 파이프라인에서 파싱/추출이 쉬워져 후처리 단계 토큰 재소비를 줄임
- `--sandbox read-only`: 읽기만 필요한 자동화에서 의도치 않은 쓰기 시도 → 재시도 루프 → 토큰 낭비를 차단
- `--skip-git-repo-check`: 신뢰하는 디렉토리가 아니어도 실행 가능
- `--ephemeral`: 세션 파일을 디스크에 저장 안 함
- `--color never`: 파이프 출력이 깔끔해짐

### 5) 번외: `attribution` 비우기

`commit_attribution = ""` 으로 커밋 로그를 깔끔하게 만들 수 있습니다. 클로드의 `attribution` 설정과 동일하니 설명은 생략합니다.

## 맺으며

처음에는 단순한 호기심에서 시작했지만 이렇게 조사해서 공부하다 보니 재미있었습니다. 실제로 토큰도 더 아낄 수 있게 됐고, 특히 저는 비대화형 모드를 평소에 많이 쓰고 있었기 때문에 더욱 값진 시간이었어요.

꼼꼼히 사실 확인을 했지만 당연히 틀린 부분이 있을 수 있습니다. 편하게 제보해주시면 감사하겠습니다.

### 참고자료

- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)
- [Claude Code in JetBrains](https://code.claude.com/docs/en/jetbrains)
- [Codex config reference](https://developers.openai.com/codex/config-reference)
- [Codex CLI features](https://developers.openai.com/codex/cli/features)
- [OpenAI MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI Codex repository](https://github.com/openai/codex)
