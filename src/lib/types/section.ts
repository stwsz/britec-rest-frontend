import type { Item } from '$lib/types/Item';

export type Section = {
	id: number;
	description: string;
	items: Item[];
};
