import { MONGO_URL } from '$env/static/private';
import { spreadAsync } from '$lib/util';
import { MongoClient, ObjectId, type Document, type WithId } from 'mongodb';

const client = new MongoClient(MONGO_URL).db('upc');

export const db = {
	note_favorites: client.collection('note_favorites'),
	users: client.collection('users'),
	courses: client.collection('courses'),
	notes: client.collection('notes')
};

export async function spreadMongo<T>(iter: AsyncIterable<WithId<Document>>): Promise<T[]> {
	const mongos: WithId<Document>[] = await spreadAsync(iter);
	const out = mongos.map((c) => deMongoSync<T>(c));
	return out as any;
}

export function doMongo<T extends { _id: string }>(item: Partial<T>): WithId<Document> {
	return { ...item, _id: new ObjectId(item._id) };
}

function deMongoSync<T>(item: WithId<Document> | null): T | null {
	if (!item) return null;
	return { ...(item as any), _id: item._id.toString() };
}

export async function deMongo<T>(p: Promise<WithId<Document> | null>): Promise<T | null> {
	let item = await p;
	if (!item) return null;
	return { ...(item as any), _id: item._id.toString() };
}
