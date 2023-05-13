export type Course = {
	name: string;
	slug: string;
	_id: string;
};

export type Note = {
	courseSlug: string;
	anonymous: boolean;
	email: string;
	text: string;
	_id: string;
};

export type NoteFavorite = {
	courseSlug: string;
	email: string;
	noteId: string;
};
