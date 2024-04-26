export interface PatchConfig {
	dotenvPath: string
	environmentsDir: string
	patchesDir: string
}

export interface Patch {
	name: string
	path: string
	apply: () => Promise<void>
	revert: () => Promise<void>
}

export interface Environment {
	name: string
	currentPatch: string
	patchHistory: PatchRecord[]
}

export interface PatchRecord {
	patchName: string
	timestamp: number
	success: boolean
	logs: string
}
