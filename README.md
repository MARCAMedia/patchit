# PatchIt

PatchIt is a NodeJS library for managing and executing database migrations or
patches. It provides a simple CLI for initializing projects, creating and
applying patches, and managing deployment environments.

## Features

-   Initialize PatchIt projects with necessary directory structure
-   Create and manage deployment environments
-   Create, detect and execute patches in sequence
-   Roll patches forward or backward to specific versions
-   Handle asynchronous patch logic
-   Log patch executions and custom logging
-   Load environment variables for patch processes
-   TypeScript support

## Usage

### Installation

Install PatchIt as a development dependency in your NodeJS project:

```bash
   npm install --save-dev patchit
```

### Initialization

Initialize a PatchIt project in your current directory:

```bash
   npx patchit init
```

This will create the necessary directories:

-   `patches/`: Directory for storing patch files
-   `environments/`: Directory for storing environment configurations
-   `logs/`: Directory for storing patch execution logs

### Creating Environments

Create a new deployment environment:

```bash
    npx patchit new-env
```

Follow the prompts to specify a name for the environment. This will create a new
JSON configuration file in the `environments/` directory.

### Creating Patches

Create a new patch file:

```bash
npx patchit new-patch
```

Follow the prompts to provide a name for the patch. This will create a new
directory in the `patches/` folder with the naming convention `patch_v1-{name}`,
containing an `index.ts` file with stub `apply` and `revert` functions.

Implement your patch logic in the `apply` function, and any necessary rollback
logic in the `revert` function.

### Applying Patches

To apply patches to an environment, run:

```bash
npx patchit apply
```

This will prompt you to select a target environment and patch version to apply
up to. You can also optionally specify the path to your environment variables
file (dotenv).

PatchIt will execute patches in sequence up to and including the selected
version. Patch logs will be written to the `logs/` directory.

You can also run in non-interactive mode by providing the necessary options:

```bash
npx patchit apply --env production --config patchit.yml
```
