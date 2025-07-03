<script lang="ts">
	import isAlpha from 'validator/lib/isAlpha';

	export let label = '';
	export let placeholder = '';
	export let typeInput = '';
	export let idInput = '';
	export let errorText = '';
	export let value: string | undefined = undefined;

	let validate = true;
	let touched = false;

	const validateInput = (val: string): boolean => {
		if (typeInput === 'password') {
			return val !== '' && val.length <= 45;
		}
		return val !== '' && isAlpha(val);
	};

	const handleBlur = (e: Event) => {
		touched = true;
		const target = e.target as HTMLInputElement;
		validate = validateInput(target.value.trim());
	};

	$: validate = touched ? validateInput(value?.trim() || '') : true;
</script>

<div class="flex flex-col items-start gap-2">
	<label for={idInput} class="text-base-dark flex flex-col gap-1.5 font-semibold">
		{label}
	</label>

	<input
		type={typeInput}
		id={idInput}
		{placeholder}
		class="border-primary w-full rounded-sm border p-2 placeholder:text-sm focus:ring-1 focus:outline-none"
		on:blur={handleBlur}
		bind:value
	/>

	<span
		class={`text-error text-xs font-medium ${!validate && touched ? 'opacity-100' : 'opacity-0'}`}
		>{errorText}</span
	>
</div>
