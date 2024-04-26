import * as fs from 'fs'
import * as path from 'path'

export class Logger {
	private logStream: fs.WriteStream

	constructor(private operation: string) {
		const timestamp = Date.now()
		const logDir = path.join(process.cwd(), 'logs')
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir)
		}
		this.logStream = fs.createWriteStream(
			path.join(logDir, `${operation}-${timestamp}.log`),
			{ flags: 'a' }
		)
	}

	log(message: string) {
		console.log(message)
		this.logStream.write(`[${new Date().toISOString()}] ${message}\n`)
	}

	error(message: string) {
		console.error(message)
		this.logStream.write(
			`[${new Date().toISOString()}] ERROR: ${message}\n`
		)
	}

	finalize() {
		this.logStream.end()
	}
}
