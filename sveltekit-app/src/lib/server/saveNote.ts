import { error, fail, type Cookies } from '@sveltejs/kit';
import { authorizeSvelte } from '$lib/server/auth';
import { db, deMongo } from './db';
import { PLS_SIGN_IN } from '$lib/str';
import { calculateKeywordDiff, calculateNoteScore } from './gpt';
import type { Course } from '$lib/types';

export async function saveNote(
	cookies: Cookies,
	params: { slug: string; lecture: string },
	text: string = '',
	anonymous = true
) {
	const auth = authorizeSvelte(cookies);
	if (!auth) return fail(401, { msg: PLS_SIGN_IN });

	const course = await deMongo<Course>(db.courses.findOne({ slug: params.slug }));
	if (!course) throw error(404, 'Course not found');
	const lecture = course.lectures.find((l) => l.datestamp == params.lecture);
	if (!lecture) throw error(404, 'Lecture not found');

	const noteFilter = {
		email: auth.email,
		courseSlug: params.slug,
		isoDate: params.lecture
	};
	const review = await calculateNoteScore(text);
	const diff = await calculateKeywordDiff(lecture.source ?? '', text);
	console.log('Got keyword diff', diff);
	const note = {
		...noteFilter,
		anonymous,
		text,
		score: review.score,
		reason: review.reason,
		diff: diff.toFixed(0)
	};

	return (await db.notes.replaceOne(noteFilter, note, { upsert: true })).upsertedId?.toString();
}

export async function createNote(cookies: Cookies, params: { slug: string; lecture: string }) {
	const auth = authorizeSvelte(cookies);
	if (!auth) return fail(401, { msg: PLS_SIGN_IN });

	const course = await deMongo<Course>(db.courses.findOne({ slug: params.slug }));
	if (!course) throw error(404, 'Course not found');
	const lecture = course.lectures.find((l) => l.datestamp == params.lecture);
	if (!lecture) throw error(404, 'Lecture not found');

	const noteFilter = {
		email: auth.email,
		courseSlug: params.slug,
		isoDate: params.lecture
	};
	const note = {
		...noteFilter,
		anonymous: true,
		text: '',
		score: null,
		reason: null,
		diff: null
	};

	return (await db.notes.replaceOne(noteFilter, note, { upsert: true })).upsertedId?.toString();
}
