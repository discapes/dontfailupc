import { db, deMongo, spreadMongo } from '$lib/server/db';
import type { Message } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const messages: Message[] = await spreadMongo(db.chat.find({ slug: params.slug }));
	return {
		messages
	};
};
