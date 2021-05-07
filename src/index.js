#!/usr/bin/env node

const program = require('commander')
const packageJson = require('../package.json')
const Runner = require('../src/Runner')

program
	.version(packageJson.version, '-v, --version')
	.description(packageJson.description)

program
	.command('generate')
	.description('Use environment variables to generate wrangler.toml from template')

	.option('-t, --template <path>', 'path to the wrangler.toml template', 'workerConfig.toml')
	.option('-o, --output <path>', 'path to the output wrangler.toml', 'wrangler.toml')
	.option('-e, --env <path>', 'path to .env file')

	.option('-d, --debug', 'enable debug mode', false)
	.action((options) => {
		const runner = new Runner(null, options)
		runner.generate()
	})

program
	.command('start')
	.alias('deploy')
	.description('Inteactive generation of wrangler.toml from template')

	.option('-t, --template <path>', 'path to the wrangler.toml template', 'workerConfig.toml')
	.option('-o, --output <path>', 'path to the output wrangler.toml', 'wrangler.toml')

	.option('-d, --debug', 'enable debug mode', false)
	.action((options) => {
		const runner = new Runner(null, options)
		runner.setup()
	})

program
	.command('migrate')
	.description('Will migrate your old wrangler.toml to a new workerConfig.toml')

	.option('-i, --input <path>', 'path to the old wrangler.toml file', 'wrangler.toml')
	.option('-o, --output <path>', 'path to the output workerConfig.toml', 'workerConfig.toml')
	.option('-g, --gitignore <path>', 'path to .gitignore file', '.gitignore')

	.option('-d, --debug', 'enable debug mode', false)
	.action((options) => {
		const runner = new Runner(null, options)
		runner.migrate()
	})

program.on('command:*', (operands) => {
	console.error(`error: unknown command '${ operands[0] }'\n`)
	program.help()
})

program.parse(process.argv)