const inquirer = require('inquirer')

const inputAccountId = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'accountId',
					message: `Account ID:`
				}
			])
			.then((answers) => {
				resolve(answers.accountId)
			})
	})
}

const inputName = async (defaultName) => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'name',
					message: `Worker Name:`,
					...(defaultName && { default: defaultName })
				}
			])
			.then((answers) => {
				resolve(answers.name)
			})
	})
}

const confirmNamespaceCreation = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'confirm',
					name: 'create',
					message: `Create the missing namespaces automatically?`
				}
			])
			.then((answers) => {
				resolve(answers.create)
			})
	})
}

const confirmPublish = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'confirm',
					name: 'publish',
					message: `Do you want to deploy the Worker now?`
				}
			])
			.then((answers) => {
				resolve(answers.publish)
			})
	})
}

const confirmSecretAdding = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'confirm',
					name: 'add',
					message: `Do you want to add the missing secrets now?`
				}
			])
			.then((answers) => {
				resolve(answers.add)
			})
	})
}

const inputSecrets = async (secrets) => {
	return new Promise((resolve) => {
		inquirer
			.prompt(secrets.map((secret) => {
				return {
					type: 'password',
					name: secret,
					mask: '*',
					message: `Enter a value for "${ secret }":`,
					validate: (value) => {
						return value.length > 0
					}
				}
			}))
			.then((answers) => {
				resolve(answers)
			})
	})
}

const confirmVariableAdding = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'confirm',
					name: 'add',
					message: `Do you want to add the missing variables now?`
				}
			])
			.then((answers) => {
				resolve(answers.add)
			})
	})
}


const inputVariables = async (variables) => {
	return new Promise((resolve) => {
		inquirer
			.prompt(variables.map((variable) => {
				return {
					type: 'input',
					name: variable,
					message: `Enter a value for "${ variable }":`,
					validate: (value) => {
						return value.length > 0
					}
				}
			}))
			.then((answers) => {
				resolve(answers)
			})
	})
}

const selectDomainType = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'deploy',
					message: `Where do you want to deploy the Worker to?`,
					choices: [
						'Deploy to workers.dev subdomain',
						'Deploy to your own zone'
					]
				}
			])
			.then((answers) => {
				resolve(answers.deploy)
			})
	})
}

const inputZoneId = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'zoneId',
					message: `Zone ID:`,
					validate: (value) => {
						return value.length > 0
					}
				}
			])
			.then((answers) => {
				resolve(answers.zoneId)
			})
	})
}

const inputRoutes = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'routes',
					message: 'Enter a route for your Worker (seperate multiple routes with ","):',
					validate: (value) => {
						return value.length > 4
					}
				}
			])
			.then((answers) => {
				resolve(answers.routes.split(',').map((item) => item.trim()))
			})
	})
}

const selectAuthMethod = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'method',
					message: `How do you want to login?`,
					choices: [
						'Using the Browser',
						'Using an API Token'
					]
				}
			])
			.then((answers) => {
				if (answers.method === 'Using the Browser') resolve('browser')

				return resolve('token')
			})
	})
}

const inputApiToken = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'password',
					name: 'token',
					message: `Enter API Token:`,
					mask: '*',
					validate: (value) => {
						return value.length > 0
					}
				}
			])
			.then((answers) => {
				resolve(answers.token)
			})
	})
}

module.exports = {
	inputAccountId,
	inputName,
	confirmNamespaceCreation,
	confirmPublish,
	confirmSecretAdding,
	inputSecrets,
	confirmVariableAdding,
	inputVariables,
	selectDomainType,
	inputZoneId,
	inputRoutes,
	selectAuthMethod,
	inputApiToken
}