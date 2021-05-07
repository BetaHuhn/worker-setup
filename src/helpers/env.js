require('dotenv').config()

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

const getValue = (key, type = 'string') => {

	const val = getEnv(key)
	if (!val) return undefined

	if (type === 'array') {
		return parseArray(val)
	}

	if (type === 'boolean') {
		return parseBoolean(val)
	}

	return val.trim()
}

module.exports = {
	getValue
}