#!/usr/bin/env node

const program = require('commander')
const packageJson = require('../package.json')
const Runner = require('../src/Runner')

program
	.version(packageJson.version, '-v, --version')
	.description(packageJson.description)
	.addHelpText('before', `👷🛠️   ${ packageJson.name } v${ packageJson.version }\n`)
	.addHelpText('after', `\nBy ${ packageJson.author }\n${ packageJson.homepage } - ${ packageJson.license } License`)

program
	.option('-d, --debug', 'enable debug mode', false)
	.option('-t, --template <path>', 'path to the Worker config file', 'workerConfig.toml')
	.option('-o, --output <path>', 'path to the output wrangler.toml', 'wrangler.toml')

program
	.command('deploy')
	.alias('start')
	.description('Interactive setup and deployment of Worker based on Worker config file')
	.action((options, cmd) => {
		const runner = new Runner(null, { ...cmd.parent.opts(), ...options })
		runner.deploy()
	})

program
	.command('generate')
	.description('Generate wrangler.toml from Worker config file using environment variables')
	.option('-e, --env <path>', 'path to .env file')
	.action((options, cmd) => {
		const runner = new Runner(null, { ...cmd.parent.opts(), ...options })
		runner.generate()
	})

program
	.command('login')
	.description('Login with CloudFlare using the browser or a api token')
	.option('-m, --method <browser/token>', 'specify which auth method to use')
	.action((options, cmd) => {
		const runner = new Runner(null, { ...cmd.parent.opts(), ...options })
		runner.login()
	})

program
	.command('migrate')
	.description('Migrate your old wrangler.toml to a new workerConfig.toml')
	.option('-i, --input <path>', 'path to the old wrangler.toml file', 'wrangler.toml')
	.option('-o, --output <path>', 'path to the output workerConfig.toml', 'workerConfig.toml')
	.option('-g, --gitignore <path>', 'path to .gitignore file', '.gitignore')
	.action((options, cmd) => {
		const runner = new Runner(null, { ...cmd.parent.opts(), ...options })
		runner.migrate()
	})

program.on('command:*', (operands) => {
	console.error(`error: unknown command '${ operands[0] }'\n`)
	program.help()
})

program.parse(process.argv)