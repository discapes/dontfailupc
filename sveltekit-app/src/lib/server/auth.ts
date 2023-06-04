import { env } from '$env/dynamic/private';
import type { Auth } from '$lib/types';
import type { Cookies } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export function authorize(token: string, nonce: string): Auth | null {
	try {
		const payload: Auth = jwt.verify(token, env.AUTH0_PUBKEY, {
			nonce,
			algorithms: ['RS256']
		}) as any;
		// console.log('id token payload:', payload);
		return payload;
	} catch (e) {
		console.log('user not logged in: ', e);
		return null;
	}
}

export function authorizeSvelte(cookies: Cookies): Auth | null {
	const token = cookies.get('id_token');
	const nonce = cookies.get('nonce');
	if (nonce && token) return authorize(token, nonce);
	else return null;
}
