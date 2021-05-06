const { execCmd } = require('./helpers/cmd')

const isAuthenticated = async () => {
	try {
		const output = await execCmd(`wrangler whoami`)

		const rgx = /\|\s([\w\d]*)\s*\|\s([\w\d]*)\s*\|/g
		const matches = rgx.exec(output)

		if (matches.length === 3) {
			return matches[2]
		}

		return true
	} catch (err) {
		return false
	}
}

const getNamespaces = async (accountId) => {
	const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } wrangler kv:namespace list`)

	return JSON.parse(output)
}

const createNamespace = async (accountId, name) => {
	try {
		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } wrangler kv:namespace create ${ name }`)

		const rgx = /id\s=\s"(\w*\d*)"/

		const match = rgx.exec(output)

		if (!match[1]) {
			return undefined
		}

		return match[1]
	} catch (err) {
		return undefined
	}
}

const getSecrets = async (accountId) => {
	const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } wrangler secret list`)

	return JSON.parse(output)
}

const publishWorker = async (accountId) => {
	try {

		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } wrangler publish`)

		if (!output.includes('successfully')) return undefined

		const domainRgx = /https:\/\/(.*)/
		const matchDomain = domainRgx.exec(output)

		if (!matchDomain[1]) return undefined

		const sizeRgx = /project size is (.*)\./
		const sizeMatch = sizeRgx.exec(output)

		return {
			domain: matchDomain[1],
			size: sizeMatch[1]
		}
	} catch (err) {
		return undefined
	}
}

const saveSecret = async (accountId, key, value) => {
	try {
		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } echo ${ value } | wrangler secret put ${ key }`)

		if (!output.includes('Success')) return false

		return true
	} catch (err) {
		return false
	}
}

module.exports = {
	isAuthenticated,
	getNamespaces,
	createNamespace,
	getSecrets,
	saveSecret,
	publishWorker
}