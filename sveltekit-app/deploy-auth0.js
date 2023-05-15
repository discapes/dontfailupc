import { exit } from 'process';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

const token = await prompt('Management API token? ');
if (!token || !token.length) throw new Error('Provide a token');
const appId = await prompt('Client ID? ');
if (!appId || !appId.length) throw new Error('Provide a client id');

const { message } = await fetch('https://login.auth0.com/api/v2/actions/actions', {
	headers: {
		Authorization: 'Bearer ' + token
	}
}).then((res) => res.json());

const domain = message.match(/https:\/\/(.*?)\//)[1];
if (!domain) throw new Error('Error fetching your tenant domain. Message: ' + message);

const getClientResponse = await fetch(
	`https://${domain}/api/v2/clients/${appId}?fields=signing_keys&include_fields=true`,
	{
		headers: {
			Authorization: 'Bearer ' + token
		}
	}
).then((res) => res.json());

console.log('Get client response:', getClientResponse);

const signingKey = getClientResponse.signing_keys[0].cert;

const createActionResponse = await fetch(`https://${domain}/api/v2/actions/actions`, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: 'Bearer ' + token
	},
	body: JSON.stringify({
		name: 'add-metadata',
		supported_triggers: [
			{
				id: 'post-login',
				version: 'v2'
			}
		],
		code: 'exports.onExecutePostLogin = async (event, api) => api.idToken.setCustomClaim("app_metadata", event.user.app_metadata)',
		runtime: 'node16'
	})
}).then((res) => res.json());

console.log('Create action response:', createActionResponse);
const { id } = createActionResponse;

const deployActionResponse = await fetch(`https://${domain}/api/v2/actions/actions/${id}/deploy`, {
	method: 'POST',
	headers: {
		Authorization: 'Bearer ' + token
	}
}).then((res) => res.json());

console.log('Depoy action response:', deployActionResponse);

const hookActionResponse = await fetch(
	`https://${domain}/api/v2/actions/triggers/post-login/bindings`,
	{
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + token
		},
		body: JSON.stringify({
			bindings: [
				{
					ref: {
						type: 'action_id',
						value: id
					},
					display_name: 'Add metadata'
				}
			]
		})
	}
).then((res) => res.json());

console.log('Hook action response:', hookActionResponse);

console.log('Action successfully deployed');

console.log(`Add the following to your .env file (repository root)\n`);
console.log(`AUTH0_PUBKEY=${signingKey.replaceAll('\r\n', '')}`);
console.log(`AUTH0_DOMAIN=${domain}`);

exit(0);
