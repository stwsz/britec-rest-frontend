import { writable } from 'svelte/store';
import type { User } from '$lib/types/user';

const initialUser: User = {
	id: undefined,
	username: undefined
};

export const userInfo = writable(initialUser);
