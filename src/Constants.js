const wranglerOptions = [
	{
		key: 'name',
		type: 'string'
	},
	{
		key: 'type',
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
		key: 'webpack_config',
		type: 'string'
	},
	{
		key: 'dev',
		type: 'string'
	},
	{
		key: 'usage_model',
		type: 'string'
	},
	{
		key: 'workers_dev',
		type: 'boolean'
	},
	{
		key: 'routes',
		type: 'array'
	},
	{
		key: 'environment_variables',
		type: 'array'
	},
	{
		key: 'kv_namespace_bindings',
		type: 'kvArray'
	}
]

module.exports = {
	wranglerOptions
}