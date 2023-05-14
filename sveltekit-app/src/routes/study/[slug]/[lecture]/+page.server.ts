import { authorizeSvelte } from '$lib/server/auth';
import { db, deMongo, doMongo, spreadMongo } from '$lib/server/db';
import { createNote, saveNote } from '$lib/server/saveNote';
import { PLS_SIGN_IN } from '$lib/str';
import type { Course, Note, NoteFavorite } from '$lib/types';
import { getNoteUrl } from '$lib/url';
import { error, fail, redirect, type ServerLoad } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	async create({ cookies, params }) {
		let id = await createNote(cookies, params);
		if (typeof id != 'string') return id;
		throw redirect(303, getNoteUrl(params.slug, params.lecture, id, true));
	},
	async setSource({ cookies, params, request }) {
		const auth = authorizeSvelte(cookies);
		if (!auth?.app_metadata.admin) throw error(401, 'Forbidden');

		const course = await deMongo<Course>(db.courses.findOne({ slug: params.slug }));
		if (!course) throw error(404, 'Course not found');
		const lecture = course.lectures.find((l) => l.datestamp == params.lecture);
		if (!lecture) throw error(404, 'Lecture not found');

		const formData = await request.formData();
		const source = formData.get('source')?.toString();
		if (!source || !source.length) throw error(404, 'Specify source');

		lecture.source = source;
		await db.courses.replaceOne({ slug: course.slug }, doMongo(course));

		return { msg: `Source text set successfully. [${source.slice(0, 20)}...]` };
	},
	async favorite({ cookies, request, params }) {
		const auth = authorizeSvelte(cookies);
		if (!auth) return fail(401, { msg: PLS_SIGN_IN });
		const id = (await request.formData()).get('id')?.toString();
		if (!id) return fail(404, { msg: 'Invalid course id' });

		const noteFav: NoteFavorite = {
			courseSlug: params.slug,
			email: auth.email,
			noteId: id,
			isoDate: params.lecture
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
			noteId: id,
			isoDate: params.lecture
		};
		await db.note_favorites.deleteOne(noteFav);
	}
};

export const load: ServerLoad = async ({ cookies, params }) => {
	const auth = authorizeSvelte(cookies);

	const [course, notes, favorites] = await Promise.all([
		deMongo<Course>(db.courses.findOne({ slug: params.slug })),
		spreadMongo<Note>(db.notes.find({ courseSlug: params.slug, isoDate: params.lecture })).then(
			(notes) =>
				notes.map((n) => ({
					email: n.anonymous ? null : n.email,
					text: n.text,
					_id: n._id,
					own: n.email == auth?.email,
					score: n.score,
					diff: n.diff
				}))
		),
		auth
			? spreadMongo<NoteFavorite>(
					db.note_favorites.find({
						courseSlug: params.slug,
						email: auth.email,
						isoDate: params.lecture
					})
			  ).then((nfvs) => nfvs.map((nf) => nf.noteId))
			: Array<string>()
	]);
	if (!course) throw error(404, 'Course not found');
	const lecture = course.lectures.find((l) => l.datestamp == params.lecture);
	if (!lecture) throw error(404, 'Lecture not found');

	return {
		course,
		notes,
		favorites,
		lecture
	};
};
