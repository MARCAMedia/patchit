#!/usr/bin/env node
import { program } from 'commander'
import inquirer from 'inquirer'
import { PatchExecutor } from './patchExecutor'
import { EnvironmentManager } from './environmentManager'
import { PatchDetector } from './patchDetector'
import * as fs from 'fs'
import * as path from 'path'
import yaml from 'js-yaml'
import { Environment, Patch, PatchConfig } from './types'

const defaultConfig: PatchConfig = yaml.load(
	fs.readFileSync(path.join(__dirname, '../.patchit.yaml'), 'utf8')
) as PatchConfig

program
	.command('init')
	.description('Initialize a new PatchIt project')
	.action(async () => {
		// Create directories
		fs.mkdirSync('./patches')
		fs.mkdirSync('./environments')
		fs.mkdirSync('./logs')

		console.log('PatchIt project initialized!')
	})

program
	.command('new-env')
	.description('Create a new environment configuration')
	.action(async () => {
		const answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'envName',
				message: 'Enter the name of the new environment:',
			},
		])

		const envMgr = new EnvironmentManager(defaultConfig.environmentsDir)
		envMgr.createEnv(answers.envName)

		console.log(`Environment '${answers.envName}' created!`)
	})

program
	.command('new-patch')
	.description('Create a new patch')
	.action(async () => {
		const answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'patchName',
				message: 'Enter the name of the new patch (e.g. quick-fix):',
			},
		])

		const detector = new PatchDetector(defaultConfig.patchesDir)
		detector.createPatch(answers.patchName)

		console.log(`Patch '${answers.patchName}' created!`)
	})

program
	.command('apply')
	.description('Apply patches')
	.option('-e, --env <env>', 'Path to environment file')
	.option('-c, --config <config>', 'Path to config file')
	.action(async options => {
		let config: PatchConfig = defaultConfig

		if (options.config) {
			config = yaml.load(
				fs.readFileSync(options.config, 'utf8')
			) as PatchConfig
		}

		const envMgr = new EnvironmentManager(config.environmentsDir)
		const detector = new PatchDetector(config.patchesDir)
		const executor = new PatchExecutor(envMgr, detector, config)

		let env: Environment

		if (options.env) {
			env = await envMgr.loadEnv(options.env)
		} else {
			const envs = await envMgr.getEnvironments()
			const answers = await inquirer.prompt([
				{
					type: 'list',
					name: 'env',
					message: 'Select the target environment:',
					choices: envs.map((e: Environment) => e.name),
				},
			])
			env = envs.find((e: Environment) => e.name === answers.env)!
		}

		const patches = await detector.getPatches()

		const answers = await inquirer.prompt([
			{
				type: 'list',
				name: 'patch',
				message: 'Select the target patch:',
				choices: patches.map((p: Patch) => p.name),
			},
			{
				type: 'input',
				name: 'dotenvPath',
				message: 'Enter the path to the dotenv file:',
				default: './.env',
			},
		])

		const targetPatch = patches.find(
			(p: Patch) => p.name === answers.patch
		)!

		await executor.applyPatches(env, targetPatch, answers.dotenvPath)
	})

// Similar 'revert' command omitted for brevity

program.parse(process.argv)
