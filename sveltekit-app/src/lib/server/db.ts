import { env } from '$env/dynamic/private';
import { spreadAsync } from '$lib/util';
import { MongoClient, ObjectId, type Document, type WithId, Db } from 'mongodb';

let mongoDb: null | Db = null;

function client() {
	if (!mongoDb) mongoDb = new MongoClient(env.MONGODB_URI).db('upc');
	return mongoDb;
}

export const db = {
	get note_favorites() {
		return client().collection('note_favorites');
	},
	get users() {
		return client().collection('users');
	},
	get courses() {
		return client().collection('courses');
	},
	get notes() {
		return client().collection('notes');
	},
	get chat() {
		return client().collection('chat');
	}
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
