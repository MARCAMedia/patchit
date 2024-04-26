import * as fs from 'fs'
import * as path from 'path'
import { Environment, PatchRecord } from './types'

export class EnvironmentManager {
	constructor(private envsDir: string) {}

	async getEnvironments(): Promise<Environment[]> {
		const envFiles = await fs.promises.readdir(this.envsDir)

		const envs: Environment[] = []

		for (const file of envFiles) {
			const envName = path.parse(file).name
			const envPath = path.join(this.envsDir, file)
			const envData = JSON.parse(
				await fs.promises.readFile(envPath, 'utf8')
			)

			envs.push({
				name: envName,
				currentPatch: envData.currentPatch,
				patchHistory: envData.patchHistory,
			})
		}

		return envs
	}

	async loadEnv(name: string): Promise<Environment> {
		const envPath = path.join(this.envsDir, `${name}.json`)
		const envData = JSON.parse(await fs.promises.readFile(envPath, 'utf8'))

		return {
			name,
			currentPatch: envData.currentPatch,
			patchHistory: envData.patchHistory,
		}
	}

	async updateEnv(name: string, patchName: string, success: boolean) {
		const env = await this.loadEnv(name)

		env.currentPatch = patchName
		env.patchHistory.push({
			patchName,
			timestamp: Date.now(),
			success,
			logs: 'Logs will be inserted here',
		})

		await fs.promises.writeFile(
			path.join(this.envsDir, `${name}.json`),
			JSON.stringify(env, null, 2)
		)
	}

	createEnv(name: string) {
		const envFile = path.join(this.envsDir, `${name}.json`)
		fs.writeFileSync(envFile, envTemplate)
	}
}

const envTemplate = `{
  "currentPatch": "",
  "patchHistory": []  
}`
