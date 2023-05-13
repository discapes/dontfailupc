import { AUTH0_CERT } from '$lib/config';
import type { Cookies } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

type UserInfo = {
	sub: string;
	nickname: string;
	picture: string;
	updated_at: string;
	email: string;
	email_verified: false;
};

export function authorize(token: string, nonce: string): UserInfo | null {
	try {
		const payload: UserInfo = jwt.verify(token, AUTH0_CERT, {
			nonce,
			algorithms: ['RS256']
		}) as any;
		console.log('id token payload:', payload);
		return payload;
	} catch (e) {
		console.log('user not logged in: ', e);
		return null;
	}
}

export function authorizeSvelte(cookies: Cookies): UserInfo | null {
	const token = cookies.get('id_token');
	const nonce = cookies.get('nonce');
	if (nonce && token) return authorize(token, nonce);
	else return null;
}
