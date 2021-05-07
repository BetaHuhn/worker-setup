const { performance } = require('perf_hooks')

const {
	forEach,
	logger,
	getEnvVariables,
	parseTemplate,
	writeConfig
} = require('./helpers')

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

			const envVariables = getEnvVariables()

			this.log.debug(envVariables)

			Object.entries(envVariables).forEach(([ key, val ]) => {
				if (key === 'kv_namespace_bindings') {
					templateConfig['kv_namespace'] = val
					return
				}

				templateConfig[key] = val
			})

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

			if (workerConfig.environment_variables) {
				this.log.info(`The Worker you are trying to deploy requires one or more Environment Variables/Secrets`)

				this.log.load(`Checking if required secrets are set`)

				const existingVariables = await wrangler.getSecrets(accountId)
				this.log.debug(existingVariables)

				const finalVariables = []
				const missingVariables = []

				workerConfig.environment_variables.forEach((variable) => {
					const exists = existingVariables.find((item) => item.name === variable)

					if (exists) {
						finalVariables.push(variable)

						return
					}

					missingVariables.push(variable)
				})

				this.log.debug(missingVariables)

				if (missingVariables.length > 0) {

					this.log.info(`The following Environment Variables/Secrets are needed:`)
					this.log.text('')

					finalVariables.forEach((variable) => {
						console.log(`- ${ variable } (already exists)`)
					})

					missingVariables.forEach((variable) => {
						console.log(`- ${ variable } (needs to be created)`)
					})

					this.log.text('')

					const askForVariables = await io.confirmSecretAdding()
					if (!askForVariables) {
						this.log.warn(`Please create the following Environment Variables/Secrets yourself before continuing: ${ missingVariables.join(', ') }`)
						process.exit(0)
					}

					const values = await io.inputVariables(missingVariables)
					this.log.debug(values)

					this.log.load(`Saving your Variables/Secrets...`)

					await forEach(Object.entries(values), async ([ key, val ]) => {
						this.log.changeText(`Uploading "${ key }"...`)

						await wrangler.saveSecret(accountId, key, val)

						finalVariables.push(key)
					})

					this.log.succeed(`All required Variables/Secrets created`)
				} else {
					this.log.succeed(`All required Variables/Secrets already exist`)
				}
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
			this.log.info(`Built project size is ${ published.size }`)
			this.log.text(`---------------------------------------------------------------------------------`)

			this.log.succeed(`Success! Your Worker was deployed to https://${ published.domain } 🚀`)

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