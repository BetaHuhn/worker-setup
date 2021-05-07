const { performance } = require('perf_hooks')

const {
	forEach,
	logger,
	parseTemplate,
	writeConfig,
	getValue
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
			const templateConfig = await parseTemplate(this.options.template)

			this.log.debug(templateConfig)

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

			await writeConfig(this.options.output, templateConfig)

		} catch (err) {
			this.log.fail(err.message)
			this.log.debug(err)
		}
	}

	async setup() {
		try {
			this.log.info('This program will guide you through the setup of this CloudFlare Worker')
			this.log.info('Please follow the steps closely. If you want to cancel at anytime, press CTRL+C')
			this.log.text(`---------------------------------------------------------------------------------`)

			const workerConfig = await parseTemplate(this.options.template)
			this.log.debug(workerConfig)

			let accountId = await wrangler.isAuthenticated()
			this.log.debug(accountId)

			if (!accountId) {
				this.log.fail(`Could not get your Account ID automatically.`)
				this.log.info(`Visit your Workers Dashboard (https://dash.cloudflare.com/?to=/:account/workers) and paste your Account ID below:`)
				accountId = await io.inputAccountId()
			}

			workerConfig.account_id = accountId
			await writeConfig(this.options.output, { ...workerConfig, kv_namespaces: [] })

			const workerName = await io.inputName(workerConfig.name)
			workerConfig.name = workerName

			if (workerConfig.kv_namespaces) {
				this.log.info(`The Worker you are trying to deploy uses Workers KV storage.`)

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
						this.log.warn(`Please create the following KV Namespaces yourself before continuing: ${ createNamespaces.join(', ') }`)
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

			this.log.text(`---------------------------------------------------------------------------------`)

			if (workerConfig.secrets) {
				this.log.info(`The Worker you are trying to deploy requires one or more secrets`)

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
						this.log.warn(`Please create the following secrets yourself before continuing: ${ missingSecrets.join(', ') }`)
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
			}

			this.log.text(`---------------------------------------------------------------------------------`)

			if (workerConfig.variables) {
				this.log.info(`The Worker you are trying to deploy requires one or more environment variables`)

				this.log.info(`The following variables are needed:`)
				this.log.text('')

				workerConfig.variables.forEach((variableKey) => {
					console.log(`- ${ variableKey } (needs to be created)`)
				})

				this.log.text('')

				const askForVariables = await io.confirmVariableAdding()
				if (!askForVariables) {
					this.log.warn(`Please add the following variables yourself before continuing: ${ workerConfig.variables.join(', ') }`)
					process.exit(0)
				}

				const variables = await io.inputVariables(workerConfig.variables)
				this.log.debug(variables)

				workerConfig.vars = variables
				delete workerConfig.variables
			}

			this.log.text(`---------------------------------------------------------------------------------`)

			const domainType = await io.selectDomainType()
			if (domainType === 'Deploy to your own zone') {
				this.log.info(`Please go to your CloudFlare Dashboard to retrieve your Zone ID`)

				const zoneId = await io.inputZoneId()

				workerConfig.workers_dev = false
				workerConfig.zone_id = zoneId

				if (workerConfig.recommended_route) {
					this.log.info(`The author of the Worker suggests the following route: ${ workerConfig.recommended_route } (replace with your Zone)`)
				}

				const routes = await io.inputRoutes()

				this.log.debug(routes)
				workerConfig.routes = routes

				this.log.succeed(`Using your Zone "${ zoneId }"`)
			} else {
				workerConfig.workers_dev = true
			}

			this.log.text(`---------------------------------------------------------------------------------`)
			this.log.load(`Writing final config to ${ this.options.output }`)

			await writeConfig(this.options.output, workerConfig)

			this.log.succeed(`Config written to ${ this.options.output }`)
			this.log.text(`---------------------------------------------------------------------------------`)

			const publish = await io.confirmPublish()
			if (!publish) {
				this.log.warn(`Run \`wrangler publish\` to deploy your Worker manually.`)
				process.exit(0)
			}

			this.log.load(`Deploying your Worker...`)

			const t0 = performance.now()
			const published = await wrangler.publishWorker(accountId)

			const t1 = performance.now()
			const diff = t1 - t0

			this.log.text(`---------------------------------------------------------------------------------`)

			this.log.info(`Built took ${ Math.round((diff / 1000) * 100) / 100 } seconds`)
			if (published.size) this.log.info(`Built project size is ${ published.size }`)

			this.log.text(`---------------------------------------------------------------------------------`)

			const domain = published.domain ? `https://${ published.domain }` : workerConfig.routes.join(', ')
			this.log.succeed(`Success! Your Worker was deployed to ${ domain } 🚀`)

		} catch (err) {

			if (err.name === 'NOAUTH') {
				this.log.fail(`Could not authenticate with CloudFlare, please login with CloudFlare before setting up the Worker.`)
				this.log.warn(`Run \`wrangler login\` or \`wrangler config\` and then return to the setup.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'SECRETLIST') {
				this.log.fail(`Could not get your current secrets`)
				this.log.warn(`Run \`wrangler secret list\` to debug the error.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'NAMESPACELIST') {
				this.log.fail(`Could not get your existing Namespaces`)
				this.log.warn(`Run \`wrangler kv:namespace list\` to debug the error.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'CREATENAMESPACE') {
				this.log.fail(`Could not create Namespace "${ err.data }"`)
				this.log.warn(`Run \`wrangler kv:namespace create ${ err.data }\` to create the Namespace manually.`)
				return
			}

			if (err.name === 'SAVESECRET') {
				this.log.fail(`Could not create Secret "${ err.data }"`)
				this.log.warn(`Run \`wrangler secret put ${ err.data }\` to create the Secret manually.`)

				this.log.debug(err.message)
				return
			}

			if (err.name === 'PUBLISHWORKER') {
				this.log.fail(`Could not deploy the Worker.`)
				this.log.warn(`Run \`wrangler publish\` to deploy your Worker manually.`)

				this.log.debug(err.message)
				return
			}

			this.log.fail(err.message)
			this.log.debug(err)
		}
	}

}

module.exports = Runner