<script lang="ts">
	/**
	 * 검색 모달 컴포넌트
	 * 
	 * Fuse.js를 사용하여 게시글을 검색합니다.
	 * 제목, 설명, 본문 내용을 모두 검색합니다.
	 * 단축키: Cmd/Ctrl + K
	 */

	import { onMount, onDestroy } from 'svelte';
	import Fuse from 'fuse.js';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	/**
	 * 게시글 데이터 구조
	 * 서버에서 전달받은 검색 대상 데이터
	 */
	export let posts: Array<{
		slug: string;
		title: string;
		description: string;
		date: string;
		content: string; // 마크다운 문법이 제거된 순수 텍스트
	}> = [];

	// 모달 열림/닫힘 상태
	let isOpen = false;
	// 검색 쿼리
	let searchQuery = '';
	// 검색 결과
	let results: Array<{ slug: string; title: string; description: string }> = [];
	// Fuse.js 인스턴스
	let fuse: Fuse<any>;

	/**
	 * 검색 쿼리 변경 시 결과 업데이트
	 * Fuse.js로 검색하고 상위 10개 결과를 표시합니다.
	 */
	$: if (searchQuery && fuse) {
		results = fuse.search(searchQuery).map(r => r.item).slice(0, 10);
	} else {
		results = [];
	}

	/**
	 * 모달 열기 함수
	 * 헤더의 검색 버튼 클릭 시 호출됩니다.
	 */
	export function open() {
		isOpen = true;
	}

	/**
	 * 컴포넌트 마운트 시 초기화
	 * - Fuse.js 인스턴스 생성
	 * - 키보드 단축키 이벤트 리스너 등록
	 */
	onMount(() => {
		// Fuse.js 설정
		fuse = new Fuse(posts, {
			keys: ['title', 'description', 'content'], // 검색 대상 필드
			threshold: 0.4, // 0~1, 낮을수록 엄격한 매칭
			ignoreLocation: true, // 텍스트 내 위치 무시 (전체에서 검색)
			includeScore: true, // 매칭 점수 포함
			minMatchCharLength: 2 // 최소 2글자 이상 검색
		});

		// 키보드 단축키 처리
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd+K (Mac) 또는 Ctrl+K (Windows/Linux)로 모달 열기
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				isOpen = true;
			}
			// ESC로 모달 닫기
			if (e.key === 'Escape' && isOpen) {
				isOpen = false;
				searchQuery = '';
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});

	/**
	 * 검색 결과 클릭 시 해당 게시글로 이동
	 * base path를 포함하여 GitHub Pages에서도 정상 작동합니다.
	 */
	function selectResult(slug: string) {
		isOpen = false;
		searchQuery = '';
		goto(`${base}/posts/${slug}`);
	}

	/**
	 * 모달 닫기 함수
	 * 배경 클릭 또는 ESC 키로 호출됩니다.
	 */
	function closeModal() {
		isOpen = false;
		searchQuery = '';
	}
</script>

<!-- 모달 오버레이 -->
{#if isOpen}
	<div class="modal-overlay" on:click={closeModal} on:keydown>
		<div class="modal" on:click|stopPropagation on:keydown>
			<!-- 검색 입력 영역 -->
			<div class="search-input-wrapper">
				<input
					type="text"
					placeholder="검색..."
					bind:value={searchQuery}
					class="search-input"
					autofocus
				/>
				<button class="close-button" on:click={closeModal}>
					<kbd>ESC</kbd>
				</button>
			</div>

			<!-- 검색 결과 목록 -->
			{#if results.length > 0}
				<div class="results">
					{#each results as result}
						<button class="result-item" on:click={() => selectResult(result.slug)}>
							<div class="result-title">{result.title}</div>
							{#if result.description}
								<div class="result-description">{result.description}</div>
							{/if}
						</button>
					{/each}
				</div>
			{:else if searchQuery}
				<!-- 검색 결과 없음 -->
				<div class="no-results">검색 결과가 없습니다</div>
			{:else}
				<!-- 검색 전 힌트 -->
				<div class="hint">키워드를 입력하세요</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 10vh;
		z-index: 1000;
	}

	.modal {
		background: var(--color-bg);
		border-radius: 12px;
		width: 90%;
		max-width: 600px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1.1rem;
		outline: none;
		color: var(--color-text);
	}

	.close-button {
		background: var(--color-code-bg);
		border: none;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.close-button kbd {
		font-size: 0.75rem;
		color: var(--color-text-light);
	}

	.results {
		max-height: 400px;
		overflow-y: auto;
	}

	.result-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 1rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-bottom: 1px solid var(--color-border);
		transition: background 0.2s;
	}

	.result-item:hover {
		background: var(--color-code-bg);
	}

	.result-title {
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--color-text);
	}

	.result-description {
		font-size: 0.9rem;
		color: var(--color-text-light);
		line-height: 1.4;
	}

	.no-results,
	.hint {
		padding: 2rem;
		text-align: center;
		color: var(--color-text-light);
	}
</style>
