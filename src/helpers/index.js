const { logger } = require('./log')
const { getValue } = require('./env')
const { parseToml, writeToml, addToGitIgnore } = require('./fs')
const { execCmd } = require('./cmd')

// From https://github.com/toniov/p-iteration/blob/master/lib/static-methods.js - MIT © Antonio V
const forEach = async (array, callback) => {
	for (let index = 0; index < array.length; index++) {
		// eslint-disable-next-line callback-return
		await callback(array[index], index, array)
	}
}

module.exports = {
	forEach,
	logger,
	parseToml,
	writeToml,
	getValue,
	addToGitIgnore,
	execCmd
}