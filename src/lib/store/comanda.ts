import { writable } from 'svelte/store';
import { browser } from '$app/environment';

let initialComanda = {
	comanda: '',
	pedido: ''
};

if (browser) {
	const storedComanda = sessionStorage.getItem('comanda');
	const parsedComanda = storedComanda ? JSON.parse(storedComanda) : { comanda: '', pedido: '' };

	if (storedComanda) {
		initialComanda = {
			comanda: parsedComanda.comanda,
			pedido: parsedComanda.pedido
		};
	}
}

export const comanda = writable(initialComanda);

if (browser) {
	comanda.subscribe((value) => {
		sessionStorage.setItem('comanda', JSON.stringify(value));
	});
}
