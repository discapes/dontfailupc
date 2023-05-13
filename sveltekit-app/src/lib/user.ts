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
