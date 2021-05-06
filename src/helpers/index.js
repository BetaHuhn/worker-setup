const { logger } = require('./log')
const { getEnvVariables } = require('./env')
const { parseTemplate, writeConfig } = require('./toml')

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
	getEnvVariables,
	parseTemplate,
	writeConfig
}