import { error, type Cookies } from '@sveltejs/kit';
import { authorizeSvelte } from '$lib/server/auth';
import { db } from './db';

export async function saveNote(
	cookies: Cookies,
	courseSlug: string,
	text: string = '',
	anonymous = true
) {
	const auth = authorizeSvelte(cookies);
	if (!auth) throw error(401, 'Login');

	const noteFilter = {
		email: auth.email,
		courseSlug
	};

	return (
		await db.notes.replaceOne(noteFilter, { ...noteFilter, anonymous, text }, { upsert: true })
	).upsertedId;
}
