const ora = require('ora')
const chalk = require('chalk')

const logger = (logEnabled) => {
	const spinner = ora()

	const load = (text) => {
		if (text) spinner.text = text
		spinner.start()
	}

	const info = (text) => {
		spinner.info(text)
	}

	const warn = (text) => {
		spinner.warn(chalk.yellow(` ${ text }`))
	}

	const succeed = (text) => {
		spinner.succeed(` ${ text }`)
	}

	const fail = (text) => {
		spinner.fail(chalk.red(` ${ text }`))
	}

	const clear = () => {
		spinner.clear()
	}

	const text = (text) => {
		spinner.stop()
		console.log(text)
	}

	const stop = (text) => {
		if (text) {
			spinner.text = text
			spinner.stopAndPersist()
			return
		}

		spinner.stop()
	}

	const debug = (text) => {
		if (logEnabled) {
			spinner.clear()
			console.log(text)
			spinner.render()
		}
	}

	const changeText = (text) => {
		spinner.text = text
		debug(text)
	}

	return {
		load,
		changeText,
		text,
		info,
		warn,
		fail,
		debug,
		clear,
		succeed,
		stop
	}
}

module.exports = {
	logger
}