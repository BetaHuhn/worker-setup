const wranglerOptions = [
	{
		key: 'name',
		type: 'string'
	},
	{
		key: 'zone_id',
		type: 'string'
	},
	{
		key: 'account_id',
		type: 'string'
	},
	{
		key: 'route',
		type: 'string'
	},
	{
		key: 'workers_dev',
		type: 'boolean'
	},
	{
		key: 'routes',
		type: 'array'
	}
]

module.exports = {
	wranglerOptions
}