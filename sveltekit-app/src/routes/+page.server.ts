import { AUTH0_DOMAIN } from '../lib/config';
import type { PageServerLoad } from './$types';

type UserInfo = {
	sub: string;
	nickname: string;
	picture: string;
	updated_at: string;
	email: string;
	email_verified: false;
};

export const load: PageServerLoad = async (e) => {
	const token = e.cookies.get('access_token');
	if (token) {
		try {
			const userInfo: UserInfo = await fetch(AUTH0_DOMAIN + `/userinfo`, {
				headers: {
					Authorization: 'Bearer ' + token
				}
			}).then((res) => res.json());
			console.log(token);
			return {
				userInfo
			};
		} catch (e) {}
	}
	return {};
};
