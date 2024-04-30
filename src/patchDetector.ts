import * as fs from 'fs'
import * as path from 'path'
import { Patch } from './types'

export class PatchDetector {
	constructor(private patchesDir: string) {
		console.log('Patches dir:', patchesDir)
	}

	async getPatches(): Promise<Patch[]> {
		// console.log('Reading patches from', this.patchesDir)
		const patchFiles = await fs.promises.readdir(this.patchesDir)
		// console.log('Found patches:', patchFiles)

		const patches: Patch[] = []

		for (const file of patchFiles) {
			const match = /^patch_v(\d+)-/.exec(file)
			if (!match) continue

			const patchTsPath = path.resolve(this.patchesDir, file, 'index.ts')
			const patchJsPath = path.resolve(this.patchesDir, file, 'index.js')

			let patchPath
			if (fs.existsSync(patchTsPath)) {
				patchPath = patchTsPath
			} else if (fs.existsSync(patchJsPath)) {
				patchPath = patchJsPath
			} else {
				console.warn(
					`No index.ts or index.js file found for patch: ${file}`
				)
				continue
			}

			const patchModule = await import(path.resolve(patchPath))
			// console.log('Patch module:', patchModule)
			patches.push({
				name: file,
				path: patchPath,
				apply: patchModule.apply,
				revert: patchModule.revert,
			})
		}

		return patches.sort((a, b) => {
			const aVersion = parseInt(a.name.split('_v')[1])
			const bVersion = parseInt(b.name.split('_v')[1])
			return aVersion - bVersion
		})
	}

	createPatch(name: string) {
		const patchDir = path.join(this.patchesDir, `patch_v1-${name}`)
		fs.mkdirSync(patchDir)

		const patchFile = path.join(patchDir, 'index.ts')
		fs.writeFileSync(patchFile, patchTemplate)
	}
}

const patchTemplate = `
 async function apply() {
  // Write your patch logic here
}

 async function revert() {  
  // Write your revert logic here
}

module.exports = {
  apply,
  revert,
};

`
