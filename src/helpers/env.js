require('dotenv').config()

const { wranglerOptions } = require('../Constants')

const parseBoolean = (val) => {
	const trueValue = [ 'true', 'True', 'TRUE' ]
	const falseValue = [ 'false', 'False', 'FALSE' ]

	if (trueValue.includes(val)) return true
	if (falseValue.includes(val)) return false

	return undefined
}

const parseArray = (val) => {
	const array = val.split('\n').join(',').split(',')
	const filtered = array.filter((n) => n)

	return filtered.map((n) => n.trim())
}

const getEnv = (key) => {
	const transformed = key.toUpperCase()
	const val = process.env[`WRANGLER_${ transformed }`] || process.env[`CF_${ transformed }`] || ''

	if (!val) return undefined

	return val
}

const getValue = (key, type) => {

	const val = getEnv(key)
	if (!val) return undefined

	if (type === 'array') {
		return parseArray(val)
	}

	if (type === 'boolean') {
		return parseBoolean(val)
	}

	if (type === 'kvArray') {
		const bindings = parseArray(val)
		if (bindings) {
			const namespaces = []
			bindings.forEach((binding) => {
				const id = getEnv(`kv_namespace_id_${ binding }`)
				if (!id) return

				const preview = getEnv(`kv_namespace_preview_id_${ binding }`)
				if (!preview) return

				namespaces.push({
					binding: binding,
					id: id,
					preview_id: preview
				})
			})

			return namespaces
		}

		return undefined
	}

	return val.trim()
}

const getEnvVariables = () => {

	const variables = {}

	wranglerOptions.forEach((option) => {
		const val = getValue(option.key, option.type)

		if (val !== undefined) variables[option.key] = val
	})

	return variables
}

module.exports = {
	getEnvVariables
}