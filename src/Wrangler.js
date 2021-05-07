const { execCmd } = require('./helpers/cmd')

const wranglerBin = 'node_modules/.bin/wrangler'

const isAuthenticated = async () => {
	try {
		const output = await execCmd(`${ wranglerBin } whoami`)

		const rgx = /\|\s([\w\d]*)\s*\|\s([\w\d]*)\s*\|/g
		const matches = rgx.exec(output)

		return matches.length === 3 ? matches[2] : undefined
	} catch (err) {
		throw { name: 'NOAUTH', message: err.message }
	}
}

const getNamespaces = async (accountId) => {
	try {
		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } ${ wranglerBin } kv:namespace list`)

		return JSON.parse(output)
	} catch (err) {
		throw { name: 'NAMESPACELIST', message: err.message }
	}
}

const createNamespace = async (accountId, name) => {
	try {
		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } ${ wranglerBin } kv:namespace create ${ name }`)

		const rgx = /id\s=\s"(\w*\d*)"/
		const match = rgx.exec(output)

		if (!match[1]) {
			throw { name: 'CREATENAMESPACE', data: name }
		}

		return match[1]
	} catch (err) {
		throw { name: 'CREATENAMESPACE', message: err.message }
	}
}

const getSecrets = async (accountId) => {
	try {
		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } ${ wranglerBin } secret list`)

		return JSON.parse(output)
	} catch (err) {
		throw { name: 'SECRETLIST', message: err.message }
	}
}

const saveSecret = async (accountId, key, value) => {
	try {
		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } echo ${ value } | ${ wranglerBin } secret put ${ key }`)

		if (!output.includes('Success')) throw { name: 'SAVESECRET', data: key }

		return true
	} catch (err) {
		throw { name: 'SAVESECRET', message: err.message }
	}
}

const publishWorker = async (accountId) => {
	try {

		const output = await execCmd(`CF_ACCOUNT_ID=${ accountId } ${ wranglerBin } publish`)

		if (!output.toLowerCase().includes('successfully')) throw { name: 'PUBLISHWORKER' }

		const domainRgx = /https:\/\/(.*)/
		const matchDomain = domainRgx.exec(output)

		const sizeRgx = /project size is (.*)\./
		const sizeMatch = sizeRgx.exec(output)

		return {
			domain: matchDomain && matchDomain[1],
			size: sizeMatch && sizeMatch[1]
		}
	} catch (err) {
		throw { name: 'PUBLISHWORKER', message: err.message }
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