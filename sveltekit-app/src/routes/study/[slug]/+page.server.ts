import type { Course, Note, NoteFavorite } from '$lib/course';
import { authorizeSvelte } from '$lib/server/auth';
import { db, deMongo, spreadMongo } from '$lib/server/db';
import { saveNote } from '$lib/server/saveNote';
import { PLS_SIGN_IN } from '$lib/str';
import { getNoteUrl } from '$lib/url';
import { error, fail, redirect, type ServerLoad } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async create({ cookies, params, url }) {
		let id = await saveNote(cookies, params.slug);
		if (typeof id != 'string') return id;
		throw redirect(303, getNoteUrl(params.slug, id, true));
	},
	async favorite({ cookies, request, params }) {
		const auth = authorizeSvelte(cookies);
		if (!auth) return fail(401, { msg: PLS_SIGN_IN });
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(404, { msg: 'Invalid course id' });

		const noteFav: NoteFavorite = {
			courseSlug: params.slug,
			email: auth.email,
			noteId: id
		};
		await db.note_favorites.replaceOne(noteFav, noteFav, { upsert: true });
	},

	async unfavorite({ cookies, request, params }) {
		const auth = authorizeSvelte(cookies);
		if (!auth) return fail(401, { msg: PLS_SIGN_IN });
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(404, { msg: 'Invalid course id' });

		const noteFav: NoteFavorite = {
			courseSlug: params.slug,
			email: auth.email,
			noteId: id
		};
		await db.note_favorites.deleteOne(noteFav);
	}
};

export const load: ServerLoad = async ({ cookies, params }) => {
	const auth = authorizeSvelte(cookies);

	const [course, notes, favorites] = await Promise.all([
		deMongo<Course>(db.courses.findOne({ slug: params.slug })),
		spreadMongo<Note>(db.notes.find({ courseSlug: params.slug })).then((notes) =>
			notes.map((n) => ({
				email: n.anonymous ? null : n.email,
				text: n.text,
				_id: n._id,
				own: n.email == auth?.email
			}))
		),
		auth
			? spreadMongo<NoteFavorite>(
					db.note_favorites.find({ courseSlug: params.slug, email: auth.email })
			  ).then((nfvs) => nfvs.map((nf) => nf.noteId))
			: Array<string>()
	]);
	if (!course) throw error(404, 'Not found');

	return {
		course,
		notes,
		favorites
	};
};
