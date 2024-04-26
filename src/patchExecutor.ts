import { Patch, Environment, PatchConfig } from './types'
import { EnvironmentManager } from './environmentManager'
import { PatchDetector } from './patchDetector'
import { Logger } from './logger'
import * as dotenv from 'dotenv'

export class PatchExecutor {
	constructor(
		private envMgr: EnvironmentManager,
		private detector: PatchDetector,
		private config: PatchConfig
	) {}

	async applyPatches(
		env: Environment,
		targetPatch: Patch,
		dotenvPath: string
	) {
		dotenv.config({ path: dotenvPath })

		const patches = await this.detector.getPatches()
		const logger = new Logger('apply')

		let currentPatch = env.currentPatch

		for (const patch of patches) {
			if (patch.name === currentPatch) continue

			try {
				logger.log(`Applying patch: ${patch.name}`)
				await require(patch.path).apply()
				currentPatch = patch.name
				await this.envMgr.updateEnv(env.name, currentPatch, true)
			} catch (err) {
				logger.error(
					`Error applying patch ${patch.name}: ${
						(err as Error).message
					}`
				)
				await this.envMgr.updateEnv(env.name, currentPatch, false)
				throw err
			}

			if (patch.name === targetPatch.name) break
		}

		logger.log('Patching complete!')
		logger.finalize()
	}

	// Similar revertPatches method omitted
}
