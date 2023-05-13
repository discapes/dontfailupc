import type { Note } from '$lib/course';
import { authorizeSvelte } from '$lib/server/auth';
import { db, deMongo } from '$lib/server/db';
import { saveNote } from '$lib/server/saveNote';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	async save({ cookies, request, params: { slug } }) {
		const formData = await request.formData();
		const id = await saveNote(
			cookies,
			slug,
			formData.get('text')?.toString(),
			formData.has('anonymous')
		);
		if (typeof id != 'string') return id;
	}
};

export const load: PageServerLoad = async ({ params, cookies }) => {
	const auth = authorizeSvelte(cookies);

	const note = await deMongo<Note>(db.notes.findOne({ _id: new ObjectId(params.noteId) }));

	if (!note) throw error(404, 'Not found');

	return {
		text: note.text,
		email: note.anonymous ? null : note.email,
		own: note.email == auth?.email,
		anonymous: note.anonymous
	};
};
