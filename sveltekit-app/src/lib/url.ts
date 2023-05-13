export const getNoteUrl = (
	courseSlug: string,
	lectureDatestamp: string,
	noteId: string,
	edit = false
) => `/study/${courseSlug}/${lectureDatestamp}/${noteId}${edit ? '?edit' : ''}`;

export const getCourseUrl = (courseSlug: string) => `/study/${courseSlug}`;
export const getLectureUrl = (courseSlug: string, lectureDatestamp: string) =>
	`/study/${courseSlug}/${lectureDatestamp}`;

export const backBehaviour = [[new RegExp('/study/(.*?)/notes/.*'), '/study/$1']] as const;
