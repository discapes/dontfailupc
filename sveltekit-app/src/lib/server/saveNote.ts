import { error, fail, type Cookies } from '@sveltejs/kit';
import { authorizeSvelte } from '$lib/server/auth';
import { db } from './db';
import { PLS_SIGN_IN } from '$lib/str';

export async function saveNote(
	cookies: Cookies,
	courseSlug: string,
	text: string = '',
	anonymous = true
) {
	const auth = authorizeSvelte(cookies);
	if (!auth) return fail(401, { msg: PLS_SIGN_IN });

	const noteFilter = {
		email: auth.email,
		courseSlug
	};

	return (
		await db.notes.replaceOne(noteFilter, { ...noteFilter, anonymous, text }, { upsert: true })
	).upsertedId as string;
}
