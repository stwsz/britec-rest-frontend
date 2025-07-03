import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$lib/types/user';

let initialUser: User = {
	id: undefined,
	username: undefined
};

if (browser) {
	const user = sessionStorage.getItem('user');
	const parsedUser = user ? JSON.parse(user) : null;

	if (parsedUser) {
		initialUser = {
			id: parsedUser.id,
			username: parsedUser.username
		};
	}
}

export const userInfo = writable<User>(initialUser);
