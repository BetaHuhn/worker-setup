const { performance } = require('perf_hooks')
const chalk = require('chalk')

const {
	forEach,
	logger,
	parseToml,
	writeToml,
	getValue,
	addToGitIgnore
} = require('./helpers')

const { wranglerOptions } = require('./Constants')
const wrangler = require('./Wrangler')
const io = require('./io')

class Runner {
	constructor(args, options) {
		this.options = options || {}
		this.args = args || []
		this.log = logger(options.debug)
	}

	async generate() {
		try {
			this.log.load(`Parsing existing config ${ chalk.cyan(this.options.template) }...`)

			const templateConfig = await parseToml(this.options.template)
			this.log.debug(templateConfig)

			this.log.changeText(`Modifying config...`)

			wranglerOptions.forEach((option) => {
				const val = getValue(option.key, option.type)

				if (val !== undefined) templateConfig[option.key] = val
			})

			const namespaces = templateConfig.kv_namespaces
			delete templateConfig.kv_namespaces

			const finalNamespaces = []
			if (namespaces) {
				namespaces.forEach((namespace) => {
					const id = getValue(`kv_namespace_${ namespace }`)
					const preview = getValue(`kv_namespace_preview_${ namespace }`)

					finalNamespaces.push({
						binding: namespace,
						id: id || '',
						preview_id: preview || ''
					})
				})

				templateConfig.kv_namespaces = finalNamespaces
			}

			const variables = templateConfig.variables
			delete templateConfig.variables

			const finalVariables = {}
			if (variables) {
				variables.forEach((variable) => {
					const val = getValue(`var_${ variable }`)

					finalVariables[variable] = val || ''
				})

				templateConfig.vars = finalVariables
			}

			delete templateConfig.recommended_route
			delete templateConfig.secrets

			this.log.debug(templateConfig)
			this.log.changeText(`Saving config to ${ chalk.cyan(this.options.output) }...`)

			await writeToml(this.options.output, templateConfig)

			this.log.succeed(`Config ${ chalk.cyan(this.options.output) } successfully generated!`)

		} catch (err) {
			this.log.fail(err.message)
			this.log.debug(err)
		}
	}

	async deploy() {
		try {
			this.log.info('This program will guide you through the deployment of this CloudFlare Worker')
			this.log.info(`Please follow the steps closely. If you want to cancel at anytime, press ${ chalk.cyan('CTRL+C') }`)
			this.log.line()

			const workerConfig = await parseToml(this.options.template)
			this.log.debug(workerConfig)

			this.log.load(`Checking if you're authenticated with CloudFlare...`)
			const isAuthenticated = await wrangler.isAuthenticated()
			if (!isAuthenticated) {
				this.log.warn(`Could not authenticate with CloudFlare, you have to login first`)
				this.log.info(`You can login using your browser or by specifying an API token`)

				const authMethod = await io.selectAuthMethod()

				this.log.line()
				if (authMethod === 'browser') {

					await wrangler.browserLogin(this.log)

				} else {
					this.log.info(`To find your API Token, go to ${ chalk.cyan('https://dash.cloudflare.com/profile/api-tokens') } and create it using the "Edit Cloudflare Workers" template.`)

					const token = await io.inputApiToken()

					this.log.load(`Logging you in...`)
					await wrangler.tokenLogin(token)
				}
			}

			this.log.succeed(`Successfully authenticated with CloudFlare`)
			this.log.line()

			let accountId = await wrangler.getAccountId()
			this.log.debug(accountId)

			if (!accountId) {
				this.log.fail(`Could not get your Account ID automatically.`)
				this.log.info(`Visit your Workers Dashboard (${ chalk.cyan('https://dash.cloudflare.com/?to=/:account/workers') }) and paste your Account ID below:`)
				accountId = await io.inputAccountId()
			}

			workerConfig.account_id = accountId

			const workerName = await io.inputName(workerConfig.name)
			workerConfig.name = workerName

			await writeToml(this.options.output, { ...workerConfig, kv_namespaces: [] })

			if (workerConfig.kv_namespaces) {
				this.log.line()

				this.log.info(`The Worker you are trying to deploy uses Workers KV storage`)
				this.log.load(`Checking if required Namespaces exist...`)

				const existingNamespaces = await wrangler.getNamespaces(accountId)
				this.log.debug(existingNamespaces)

				const finalNamespaces = []
				const createNamespaces = []

				workerConfig.kv_namespaces.forEach((namespace) => {
					const exists = existingNamespaces.find((item) => item.title === namespace || item.title === `${ workerConfig.name }-${ namespace }`)

					if (exists) {
						finalNamespaces.push({
							binding: namespace,
							id: exists.id
						})

						return
					}

					createNamespaces.push(namespace)
				})

				this.log.debug(createNamespaces)

				if (createNamespaces.length > 0) {

					this.log.info(`The following KV Namespaces are needed:`)
					this.log.text('')

					finalNamespaces.forEach((namespace) => {
						console.log(`- ${ namespace.binding } (already exists)`)
					})

					createNamespaces.forEach((namespace) => {
						console.log(`- ${ namespace } (needs to be created)`)
					})

					this.log.text('')

					const create = await io.confirmNamespaceCreation()
					if (!create) {
						this.log.info(`Please create the following KV Namespaces yourself before continuing: ${ createNamespaces.join(', ') }`)
						process.exit(0)
					}

					this.log.load(`Creating Namespaces`)

					await forEach(createNamespaces, async (namespace) => {
						this.log.changeText(`Creating Namespace "${ namespace }"...`)

						const id = await wrangler.createNamespace(accountId, namespace)

						finalNamespaces.push({
							binding: namespace,
							id: id
						})
					})

					this.log.succeed(`All required Namespaces created`)
				} else {
					this.log.succeed(`All required Namespaces already exist`)
				}

				workerConfig.kv_namespaces = finalNamespaces
			}

			if (workerConfig.variables) {
				this.log.line()

				this.log.info(`The Worker you are trying to deploy requires one or more environment variables`)
				this.log.info(`The following variables are needed:`)
				this.log.text('')

				workerConfig.variables.forEach((variableKey) => {
					console.log(`- ${ variableKey } (needs to be created)`)
				})

				this.log.text('')

				const askForVariables = await io.confirmVariableAdding()
				if (!askForVariables) {
					this.log.info(`Please add the following variables yourself before continuing: ${ workerConfig.variables.join(', ') }`)
					process.exit(0)
				}

				const variables = await io.inputVariables(workerConfig.variables)
				this.log.debug(variables)

				workerConfig.vars = variables
				delete workerConfig.variables
			}

			this.log.line()

			const domainType = await io.selectDomainType()
			if (domainType === 'Deploy to your own zone') {
				this.log.info(`Please go to your CloudFlare Dashboard (${ chalk.cyan('https://dash.cloudflare.com') }) to retrieve your ${ chalk.cyan('Zone ID') }`)

				const zoneId = await io.inputZoneId()

				workerConfig.workers_dev = false
				workerConfig.zone_id = zoneId

				if (workerConfig.recommended_route) {
					this.log.info(`The author of the Worker suggests the following route: ${ chalk.cyan(workerConfig.recommended_route) } (replace with your Zone)`)
				}

				const routes = await io.inputRoutes()

				this.log.debug(routes)
				workerConfig.routes = routes

				this.log.succeed(`Using your Zone "${ chalk.cyan(zoneId) }"`)
			} else {
				workerConfig.workers_dev = true
			}

			this.log.line()
			this.log.load(`Writing final config to ${ chalk.cyan(this.options.output) }`)

			await writeToml(this.options.output, workerConfig)

			this.log.succeed(`Config written to ${ chalk.cyan(this.options.output) }`)
			this.log.line()

			const publish = await io.confirmPublish()
			if (!publish) {
				this.log.info(`Run ${ chalk.cyan('\`wrangler publish\`') }  to deploy your Worker manually.`)
				process.exit(0)
			}

			this.log.load(`Deploying your Worker...`)

			const t0 = performance.now()
			const published = await wrangler.publishWorker(accountId)

			const t1 = performance.now()
			const diff = t1 - t0
			const builtTime = Math.round((diff / 1000) * 100) / 100

			this.log.line()

			this.log.info(`Built took ${ chalk.cyan(builtTime + ' seconds') }`)
			if (published.size) this.log.info(`Built project size is ${ chalk.cyan(published.size) }`)

			this.log.line()

			const domain = published.domain ? `https://${ published.domain }` : workerConfig.routes.join(', ')
			this.log.succeed(`${ chalk.green('Success!') } Your Worker was deployed to ${ chalk.cyan(domain) } 🚀`)

			// Note: Secrets can only be changed after the Worker was pushed i.e. created
			if (workerConfig.secrets) {
				this.log.line()

				this.log.info(`The Worker you just deployed requires one or more secrets`)
				this.log.load(`Checking if required secrets are set`)

				const existingSecrets = await wrangler.getSecrets(accountId)
				this.log.debug(existingSecrets)

				const finalSecrets = []
				const missingSecrets = []

				workerConfig.secrets.forEach((secretKey) => {
					const exists = existingSecrets.find((item) => item.name === secretKey)

					if (exists) {
						finalSecrets.push(secretKey)

						return
					}

					missingSecrets.push(secretKey)
				})

				this.log.debug(missingSecrets)

				if (missingSecrets.length > 0) {

					this.log.info(`The following secrets are needed:`)
					this.log.text('')

					finalSecrets.forEach((secretKey) => {
						console.log(`- ${ secretKey } (already exists)`)
					})

					missingSecrets.forEach((secretKey) => {
						console.log(`- ${ secretKey } (needs to be created)`)
					})

					this.log.text('')

					const askForSecrets = await io.confirmSecretAdding()
					if (!askForSecrets) {
						this.log.info(`Please create the following secrets yourself before continuing: ${ missingSecrets.join(', ') }`)
						process.exit(0)
					}

					const secrets = await io.inputSecrets(missingSecrets)
					this.log.debug(secrets)

					this.log.load(`Saving your secrets...`)

					await forEach(Object.entries(secrets), async ([ key, val ]) => {
						this.log.changeText(`Uploading "${ key }"...`)

						await wrangler.saveSecret(accountId, key, val)

						finalSecrets.push(key)
					})

					this.log.succeed(`All required secrets created`)
				} else {
					this.log.succeed(`All required secrets already exist`)
				}

				delete workerConfig.secrets

				this.log.line()
			}

			this.log.succeed('All done! Your Worker is ready to be used ✨')
			// Print instructions
			this.log.text(chalk.cyan(domain))

		} catch (err) {

			if (err.name === 'LOGIN') {
				this.log.fail(`Could not login with CloudFlare. Maybe your token was wrong?`)
				this.log.info(`Run ${ chalk.cyan('\`wrangler login\`') } or ${ chalk.cyan('\`wrangler config\`') } to login manually or try again.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'SECRETLIST') {
				this.log.fail(`Could not get your current secrets`)
				this.log.info(`Run ${ chalk.cyan('\`wrangler secret list\`') } to debug the error.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'NAMESPACELIST') {
				this.log.fail(`Could not get your existing Namespaces`)
				this.log.info(`Run ${ chalk.cyan('\`wrangler kv:namespace list\`') } to debug the error.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'CREATENAMESPACE') {
				this.log.fail(`Could not create Namespace "${ err.data }"`)
				this.log.info(`Run ${ chalk.cyan(`\`wrangler kv:namespace create ${ err.data }\``) } to create the Namespace manually.`)
				return
			}

			if (err.name === 'SAVESECRET') {
				this.log.fail(`Could not create Secret "${ err.data }"`)
				this.log.info(`Run ${ chalk.cyan(`\`wrangler secret put ${ err.data }\``) } to create the Secret manually.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'PUBLISHWORKER') {
				this.log.fail(`Could not deploy the Worker.`)
				this.log.info(`Run ${ chalk.cyan('\`wrangler publish\`') } to deploy your Worker manually.`)

				this.log.debug(err.message)
				return
			}

			this.log.fail(err.message)
			this.log.debug(err)
		}
	}

	async migrate() {
		try {
			this.log.load(`Migrating ${ chalk.cyan(this.options.input) } to ${ chalk.cyan(this.options.output) }`)

			const wranglerConfig = await parseToml(this.options.input)
			this.log.debug(wranglerConfig)

			// Add additional options to config
			wranglerConfig.kv_namespaces = (wranglerConfig.kv_namespaces || []).map((item) => item.binding)
			wranglerConfig.variables = Object.entries(wranglerConfig.vars || {}).map(([ key ]) => key)
			wranglerConfig.recommended_route = ''
			wranglerConfig.secrets = []

			// Delete options which will be set during setup
			delete wranglerConfig.workers_dev
			delete wranglerConfig.account_id
			delete wranglerConfig.zone_id
			delete wranglerConfig.routes
			delete wranglerConfig.route
			delete wranglerConfig.vars

			await addToGitIgnore(this.options.gitignore, this.options.input)
			this.log.succeed(`${ chalk.cyan(this.options.input) } added to ${ chalk.cyan(this.options.gitignore) }`)

			await writeToml(this.options.output, wranglerConfig)
			this.log.succeed(`Transfered config from ${ chalk.cyan(this.options.input) } to ${ chalk.cyan(this.options.output) }`)

			this.log.succeed(`Migration ${ chalk.green('successful') }!`)

		} catch (err) {
			this.log.fail(err.message)
			this.log.debug(err)
		}
	}

	async login() {
		try {
			this.log.load(`Checking if already logged in...`)

			const alreadyLoggedIn = await wrangler.isAuthenticated()
			if (alreadyLoggedIn) {
				this.log.succeed(`Already logged in!`)
				return
			}

			this.log.info(`There are multiple ways to login with CloudFlare, using your browser or by specifying an API token`)

			const authMethod = await io.selectAuthMethod()

			this.log.line()
			if (authMethod === 'browser') {

				await wrangler.browserLogin(this.log)

			} else {
				this.log.info(`To find your API Token, go to ${ chalk.cyan('https://dash.cloudflare.com/profile/api-tokens') } and create it using the "Edit Cloudflare Workers" template.`)

				const token = await io.inputApiToken()

				this.log.load(`Logging you in...`)
				await wrangler.tokenLogin(token)
			}

			this.log.line()
			this.log.succeed(`Successfully logged in!`)

		} catch (err) {
			if (err.name === 'LOGIN') {
				this.log.fail(`Could not login with CloudFlare. Maybe your token was wrong?`)
				this.log.info(`Run ${ chalk.cyan('\`wrangler login\`') } or ${ chalk.cyan('\`wrangler config\`') } to login manually or try again.`)

				this.log.debug(err.message)
				return
			}

			this.log.fail(err.message)
			this.log.debug(err)
		}
	}

}

module.exports = Runner