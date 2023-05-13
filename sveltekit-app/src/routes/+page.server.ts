import { authorizeSvelte } from '$lib/server/jwt';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		userInfo: authorizeSvelte(cookies)
	};
};
