<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Fuse from 'fuse.js';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	export let posts: Array<{
		slug: string;
		title: string;
		description: string;
		date: string;
		content: string;
	}> = [];

	let isOpen = false;
	let searchQuery = '';
	let results: Array<{ slug: string; title: string; description: string }> = [];
	let fuse: Fuse<any>;

	$: if (searchQuery && fuse) {
		results = fuse.search(searchQuery).map(r => r.item).slice(0, 10);
	} else {
		results = [];
	}

	export function open() {
		isOpen = true;
	}

	onMount(() => {
		fuse = new Fuse(posts, {
			keys: ['title', 'description', 'content'],
			threshold: 0.4,
			ignoreLocation: true,
			includeScore: true,
			minMatchCharLength: 2
		});

		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				isOpen = true;
			}
			if (e.key === 'Escape' && isOpen) {
				isOpen = false;
				searchQuery = '';
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});

	function selectResult(slug: string) {
		isOpen = false;
		searchQuery = '';
		goto(`${base}/posts/${slug}`);
	}

	function closeModal() {
		isOpen = false;
		searchQuery = '';
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal} on:keydown>
		<div class="modal" on:click|stopPropagation on:keydown>
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
				<div class="no-results">검색 결과가 없습니다</div>
			{:else}
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
