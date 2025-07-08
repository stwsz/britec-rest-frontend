<script lang="ts">
	import { goto } from '$app/navigation';

	import isAlpha from 'validator/lib/isAlpha';

	import Input from '$lib/components/general/Input.svelte';
	import logoBritec from '$lib/assets/images/logos/logo-britec.webp';
	import Toast from '$lib/components/general/Toast.svelte';

	import { userInfo } from '$lib/store/user';
	import { onMount } from 'svelte';

	const ip = import.meta.env.VITE_IP;

	$: validated = false;
	$: inputNameValue = '';
	$: inputPasswordValue = '';

	let toastStatus = false;
	let toastMessage = '';
	let toastType: 'info' | 'error' | 'success' = 'info';

	onMount(() => {
		const getUserInfo = sessionStorage.getItem('user');

		if (getUserInfo) {
			goto('/sistema');
		}
	});

	function showToast(message: string, type: typeof toastType) {
		toastMessage = message;
		toastType = type;
		toastStatus = true;
	}
</script>

<svelte:head>
	<title>Login - Britec</title>
	<meta name="description" content="Faça login para acessar o sistema Britec." />
</svelte:head>

<main
	class="bg-base-light flex min-h-screen w-full flex-col items-center justify-center gap-10 p-6"
>
	<img src={logoBritec} alt="Logo da Britec" class="w-56 md:w-64" />

	<form class="flex w-full max-w-md flex-col gap-4" aria-label="Formulário de login">
		<Input
			label="Nome"
			placeholder="Digite seu nome"
			typeInput="text"
			idInput="nome"
			errorText="Nome inválido"
			bind:value={inputNameValue}
		/>

		<Input
			label="Senha"
			placeholder="Digite sua senha"
			typeInput="password"
			idInput="senha"
			errorText="Senha inválida"
			bind:value={inputPasswordValue}
		/>

		<button
			type="submit"
			class="bg-primary text-base-light hover:bg-primary/90 mt-4 cursor-pointer rounded py-2.5 text-sm font-semibold transition-colors"
			onclick={async (e) => {
				validated =
					inputNameValue !== '' &&
					isAlpha(inputNameValue) &&
					inputPasswordValue !== '' &&
					inputPasswordValue.length <= 45;

				if (validated) {
					try {
						const reqLogin = await fetch(`${ip}/api/users/login`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								username: inputNameValue,
								password: inputPasswordValue
							})
						});

						if (reqLogin.ok) {
							const resLogin = await reqLogin.json();

							console.log(resLogin);

							sessionStorage.setItem('user', JSON.stringify(resLogin.user));
							userInfo.set(resLogin.user);

							goto('/comanda');
						} else {
							showToast(
								'Não foi possível fazer login. Verifique seus dados e tente novamente.',
								'error'
							);
						}
					} catch (error) {
						e.preventDefault();

						showToast('Erro de conexão. Tente novamente mais tarde.', 'error');
					}
				} else {
					e.preventDefault();

					showToast('Preencha corretamente todos os campos antes de continuar.', 'error');
				}
			}}
		>
			Entrar
		</button>
	</form>
</main>

<Toast bind:toastStatus {toastMessage} {toastType} position="top-6 right-6" />
