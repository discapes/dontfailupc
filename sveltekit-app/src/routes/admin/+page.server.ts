import { authorizeSvelte } from '$lib/server/auth';
import { db, spreadMongo } from '$lib/server/db';
import { PLS_SIGN_IN } from '$lib/str';
import type { Course, User } from '$lib/types';
import { error, fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const actions: Actions = {
	async upsert({ cookies, request }) {
		const auth = authorizeSvelte(cookies);
		if (!auth?.app_metadata.admin) throw error(401, 'Forbidden');

		const json = (await request.formData()).get('json')?.toString();
		let obj;
		try {
			obj = JSON.parse(json!);
			let id = new ObjectId(obj._id);
			await db.courses.replaceOne({ _id: id }, { ...obj, _id: id }, { upsert: true });
		} catch (e) {
			return fail(404, { msg: 'Invalid input: ' + e });
		}
	},
	async delete({ cookies, request }) {
		const auth = authorizeSvelte(cookies);
		if (!auth?.app_metadata.admin) throw error(401, 'Forbidden');

		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(404, { msg: 'Invalid id' });
		await db.courses.deleteOne({ _id: new ObjectId(id) });
	}
};

export const load: ServerLoad = async ({ cookies }) => {
	const auth = authorizeSvelte(cookies);
	if (!auth?.app_metadata.admin) throw error(401, 'Forbidden');

	const courses = spreadMongo<Course>(db.courses.find({}));
	const users = spreadMongo<User>(db.users.find({}));

	return {
		courses,
		users
	};
};
