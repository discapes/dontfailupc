import { authorizeSvelte } from '$lib/server/jwt';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies }) => {
	const user = authorizeSvelte(cookies);
};
