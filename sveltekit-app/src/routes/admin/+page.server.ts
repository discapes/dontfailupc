import type { Course } from '$lib/course';
import { authorizeSvelte } from '$lib/server/auth';
import { db, spreadMongo } from '$lib/server/db';
import type { User } from '$lib/user';
import { error, fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const actions: Actions = {
	async upsert({ cookies, request }) {
		const user = authorizeSvelte(cookies);
		if (!user) return fail(401, { msg: 'Login' });

		const json = (await request.formData()).get('json')?.toString();
		let obj;
		try {
			obj = JSON.parse(json!);
			let id = new ObjectId(obj._id);
			await db.courses.replaceOne({ _id: id }, { ...obj, _id: id }, { upsert: true });
		} catch (e) {
			return fail(404, { msg: 'invalid input: ' + e });
		}
	},
	async delete({ cookies, request }) {
		const user = authorizeSvelte(cookies);
		if (!user) return fail(401, { msg: 'Login' });
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(404, { msg: 'id not speciified' });
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
