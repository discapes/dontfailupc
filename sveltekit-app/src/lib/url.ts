export const getNoteUrl = (courseSlug: string, noteId: string, edit = false) =>
	`/study/${courseSlug}/notes/${noteId}${edit ? '?edit' : ''}`;

export const getCourseUrl = (courseSlug: string) => `/study/${courseSlug}`;
