const { exec } = require('child_process')

const execCmd = (command, workingDir) => {
	return new Promise((resolve, reject) => {
		exec(
			command,
			{
				cwd: workingDir
			},
			function(error, stdout, stderr) {
				error ? reject(error) : resolve((stdout || stderr).trim())
			}
		)
	})
}

module.exports = {
	execCmd
}