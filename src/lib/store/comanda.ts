import { writable } from 'svelte/store';

export const comanda = writable({
	comanda: '',
	pedido: ''
});
