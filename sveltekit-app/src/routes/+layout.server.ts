import { authorizeSvelte } from '$lib/server/auth';
import { db, deMongo } from '$lib/server/db';
import type { User } from '$lib/user';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const auth = authorizeSvelte(cookies);
	const user: User | null = auth && (await deMongo(db.users.findOne({ email: auth.email })));

	return {
		user,
		auth
	};
};
