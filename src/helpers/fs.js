const fs = require('fs').promises
const TOML = require('@iarna/toml')

const parseToml = async (templatePath) => {
	try {
		const raw = await fs.readFile(templatePath)
		const data = TOML.parse(raw)

		return data
	} catch (err) {
		return undefined
	}
}

const writeToml = async (outputPath, data) => {
	const raw = TOML.stringify(data)
	await fs.writeFile(outputPath, raw)
}

const addToGitIgnore = async (filePath, data) => {
	const raw = await fs.readFile(filePath)

	// Check if file is already in .gitignore
	if (raw.toString().includes(data)) return

	await fs.writeFile(filePath, `\n${ data }`, { flag: 'a+' })
}

module.exports = {
	parseToml,
	writeToml,
	addToGitIgnore
}