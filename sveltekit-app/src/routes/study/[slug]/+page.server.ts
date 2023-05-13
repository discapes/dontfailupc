import { authorizeSvelte } from '$lib/server/auth';
import { db, deMongo } from '$lib/server/db';
import { PLS_SIGN_IN } from '$lib/str';
import type { Course, Lecture } from '$lib/types';
import { isoDate } from '$lib/util';
import { error, fail, type ServerLoad } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async save({ cookies, params, url }) {
		const auth = authorizeSvelte(cookies);
		if (!auth) return fail(401, { msg: PLS_SIGN_IN });
		const course = await deMongo<Course>(db.courses.findOne({ slug: params.slug }));
		if (!course) throw error(404, 'Not found');
		const datestamp = isoDate();
		const prev = course.lectures.find((l) => l.datestamp == datestamp);
		if (!prev || prev.creator == auth.email) {
			const lecture: Lecture = {
				creator: auth.email,
				datestamp,
				topic: '()'
			};
			await db.courses.updateOne(
				{ slug: course.slug },
				{
					$addToSet: {
						lectures: lecture
					}
				},
				{ upsert: true }
			);
		} else {
			return fail(403, { msg: 'Not authorized' });
		}
	}
};

export const load: ServerLoad = async ({ cookies, params }) => {
	const course = await deMongo<Course>(db.courses.findOne({ slug: params.slug }));
	if (!course) throw error(404, 'Not found');

	return {
		course
	};
};
