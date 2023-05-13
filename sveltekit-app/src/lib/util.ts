export async function spreadAsync<T>(iter: AsyncIterable<T>): Promise<Array<T>> {
	const arr = [];
	for await (const i of iter) arr.push(i);
	return arr;
}

export function addOrRemove<T>(arr: T[], item: T) {
	return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function emailShort(email: string) {
	if (!email.includes('@')) return email;
	else return email.slice(0, email.lastIndexOf('@'));
}

export const isoDate = () => new Date().toISOString().split('T')[0];
