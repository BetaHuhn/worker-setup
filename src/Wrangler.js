const { exec } = require('child_process')

const { execCmd } = require('./helpers')

const wranglerBin = 'node_modules/.bin/wrangler'

const isAuthenticated = async () => {
	try {
		const output = await execCmd(`${ wranglerBin } whoami`)

		if (output.toLowerCase().includes('are logged in')) return true

		return false
	} catch (err) {
		return false
	}
}

const getAccountId = async () => {
	try {
		const output = await execCmd(`${ wranglerBin } whoami`)

		const rgx = /\|\s([\w\d]*)\s*\|\s([\w\d]*)\s*\|/g
		const matches = rgx.exec(output)

		return matches.length === 3 ? matches[2] : undefined
	} catch (err) {
		return undefined
	}
}

const browserLogin = async (log) => {
	return new Promise((resolve, reject) => {
		const spawn = exec(`echo y | ${ wranglerBin } login`)

		let result = ''

		spawn.stdout.on('data', (data) => {
			const output = data.toString()

			const rgx = /(https:\/\/dash.cloudflare.com\/.*)/
			const matches = rgx.exec(output)

			if (matches && matches[1]) {
				log.info(`Please open this link in your browser and login with your username and password:`)
				log.text(matches[1])
			}

			result += data.toString()
		})

		spawn.stderr.on('data', (data) => {
			reject({ name: 'LOGIN', message: data.toString() })
		})

		spawn.on('exit', (code) => {
			if (code !== 0 || result.toLowerCase().includes('successfully configured') !== true) {
				reject({ name: 'LOGIN', message: result })
			}

			resolve()
		})
	})
}

const tokenLogin = async (token) => {
	try {
		const output = await execCmd(`echo "${ token }" | ${ wranglerBin } config`)

		if (output.toLowerCase().includes('successfully configured') === false) throw { name: 'LOGIN', message: output }

		return true
	} catch (err) {
		throw { name: 'LOGIN', message: err.message }
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
	getAccountId,
	browserLogin,
	tokenLogin,
	getNamespaces,
	createNamespace,
	getSecrets,
	saveSecret,
	publishWorker
}