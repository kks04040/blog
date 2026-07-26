export interface Post {
	slug: string;
	title: string;
	date: string;
	description?: string;
	content?: string;
	toc?: TocItem[];
	relatedPosts?: Array<{ slug: string; title: string; date: string }>;
}

export interface TocItem {
	level: number;
	text: string;
	id: string;
}
