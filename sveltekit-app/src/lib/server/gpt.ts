import { env } from '$env/dynamic/private';

export async function calculateKeywordDiff(source: string, note: string): Promise<number> {
	const res = await fetch(env.SCORING_API_URL, {
		method: 'POST',
		body: JSON.stringify({ source, note }),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((res) => res.json());
	return res.score;
}

export async function calculateNoteScore(
	notes: string
): Promise<{ score: number; reason: string }> {
	const endpoint = 'https://api.openai.com/v1/chat/completions';
	const headers = {
		Authorization: 'Bearer ' + env.OPENAI_API_KEY,
		'Content-Type': 'application/json'
	};
	const json = {
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'system',
				content:
					'Output a JSON object with the keys "score" and "reason". "score" should be an integer from 0 to a 100 that describes how likely the submitted text is well-written lecture notes for a university course. "reason" should be a string describing the reason for the score.' +
					'Well-written lecture notes are clear and they convey enough information to understand the subject.'.toUpperCase() +
					'DO NOT REPLY OUTSIDE THE JSON.'
			},
			{
				role: 'user',
				content: notes
			}
		],
		temperature: 0
	};
	const response = await fetch(endpoint, {
		method: 'POST',
		headers,
		body: JSON.stringify(json)
	}).then((res) => res.json());

	try {
		const assistantResponse: string = response.choices[0].message.content;
		console.log('GPT replied with', assistantResponse);
		const parsed = JSON.parse(assistantResponse);
		return {
			score: parsed.score,
			reason: parsed.reason
		};
	} catch (e) {
		console.error(e);
		return { score: NaN, reason: 'Could not review.' };
	}
}
