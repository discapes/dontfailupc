import type { Course } from '$lib/course';
import { authorizeSvelte } from '$lib/server/auth';
import { db, spreadMongo } from '$lib/server/db';
import { error, fail, type Actions, type ServerLoad } from '@sveltejs/kit';

function setFavorite(isFavorite: boolean) {
	const action: Actions[0] = async ({ cookies, request }) => {
		const user = authorizeSvelte(cookies);
		if (!user) return fail(401, { msg: 'Login' });
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(404, { msg: 'Course id not sepcified' });
		await db.users.updateOne(
			{ email: user.email },
			{
				[isFavorite ? '$addToSet' : '$pull']: {
					favorites: id
				}
			},
			{
				upsert: true
			}
		);
	};
	return action;
}

export const actions: Actions = {
	async favorite(e) {
		return await setFavorite(true)(e);
	},
	async unfavorite(e) {
		return await setFavorite(false)(e);
	}
};

export const load: ServerLoad = async ({ cookies }) => {
	if (!authorizeSvelte(cookies)) throw error(401, 'Login');

	return {
		courses: spreadMongo<Course>(db.courses.find({}))
	};
};
