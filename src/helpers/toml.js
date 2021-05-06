const fs = require('fs').promises
const TOML = require('@iarna/toml')

const parseTemplate = async (templatePath) => {
	try {
		const raw = await fs.readFile(templatePath)
		const data = TOML.parse(raw)

		return data
	} catch (err) {
		return undefined
	}
}

const writeConfig = async (outputPath, data) => {
	const raw = TOML.stringify(data)
	await fs.writeFile(outputPath, raw)
}

module.exports = {
	parseTemplate,
	writeConfig
}