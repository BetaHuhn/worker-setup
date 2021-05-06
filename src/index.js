#!/usr/bin/env node

const program = require('commander')
const packageJson = require('../package.json')
const Runner = require('../src/Runner')

program
	.version(packageJson.version, '-v, --version')
	.description(packageJson.description)

program
	.command('welcome <name>')
	.alias('hello')
	.description('Welcome a person')
	.option('-d, --debug', 'enable debug mode', false)
	.action((args, options) => {
		const runner = new Runner(args, options)
		runner.welcome()
	})

program.on('command:*', (operands) => {
	console.error(`error: unknown command '${ operands[0] }'\n`)
	program.help()
})

program.parse(process.argv)