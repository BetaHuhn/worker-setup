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

	.option('-l, --log', 'enable console log output', false)
	.option('-d, --debug', 'enable debug mode', false)
	.action((options) => {
		const runner = new Runner(null, options)
		runner.generate()
	})

program
	.command('setup')
	.description('Inteactive generation of wrangler.toml from template')

	.option('-t, --template <path>', 'path to the wrangler.toml template', 'workerConfig.toml')
	.option('-o, --output <path>', 'path to the output wrangler.toml', 'wrangler.toml')

	.option('-l, --log', 'enable console log output', false)
	.option('-d, --debug', 'enable debug mode', false)
	.action((options) => {
		const runner = new Runner(null, options)
		runner.setup()
	})

/* program
	.option('-i, --input <path>', 'path to the input wrangler.toml')
	.option('-o, --output <path>', 'path to the output wrangler.toml')
	.option('-d, --debug', 'log the final config to the console')
	.action((options) => {
		wranglerEnv.config(options)
	}) */

program.on('command:*', (operands) => {
	console.error(`error: unknown command '${ operands[0] }'\n`)
	program.help()
})

program.parse(process.argv)