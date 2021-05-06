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

const confirmNamespaceCreation = async () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'confirm',
					name: 'create',
					message: `Create the missing Namespaces automatically?`
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
					message: `Do you want to add the missing Variables now?`
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
					message: `Enter a value for "${ variable }":`
				}
			}))
			.then((answers) => {
				resolve(answers)
			})
	})
}

module.exports = {
	inputAccountId,
	confirmNamespaceCreation,
	confirmPublish,
	confirmSecretAdding,
	inputVariables
}