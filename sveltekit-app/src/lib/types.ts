export type Course = {
	name: string;
	slug: string;
	_id: string;
	lectures: Lecture[];
};

export type Lecture = {
	datestamp: string;
	creator: string;
	topic: string;
	source?: string;
};

export type Note = {
	courseSlug: string;
	isoDate: string;
	anonymous: boolean;
	email: string;
	text: string;
	score?: number;
	reason?: string;
	diff?: number;
	_id: string;
};

export type NoteFavorite = {
	isoDate: string;
	courseSlug: string;
	email: string;
	noteId: string;
};

export type Chat = {
	slug: string;
	messages: Message[];
};

export type Message = {
	user: string;
	message: string;
	timestamp: number;
};

export type User = {
	favorites?: string[];
	email: string;
};

export type Auth = {
	sub: string;
	nickname: string;
	picture: string;
	updated_at: string;
	email: string;
	email_verified: false;
	app_metadata: {
		admin?: boolean;
	};
};
