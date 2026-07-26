
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const TERMINAL_PERSISTENT_SHELL: string;
	export const TERMINAL_CONTAINER_CPU: string;
	export const WARP_CLI_AGENT_PROTOCOL_VERSION: string;
	export const TERM_PROGRAM: string;
	export const NODE: string;
	export const INIT_CWD: string;
	export const HERMES_KANBAN_BOARD: string;
	export const BROWSER_INACTIVITY_TIMEOUT: string;
	export const WARP_HONOR_PS1: string;
	export const TERM: string;
	export const SHELL: string;
	export const TERMINAL_LIFETIME_SECONDS: string;
	export const HOMEBREW_REPOSITORY: string;
	export const TMPDIR: string;
	export const npm_config_global_prefix: string;
	export const WARP_PROMPT_NODE_VERSION_ENABLED: string;
	export const PYTHONUNBUFFERED: string;
	export const WARP_TERMINAL_SESSION_UUID: string;
	export const TERM_PROGRAM_VERSION: string;
	export const TERMINAL_DOCKER_VOLUMES: string;
	export const HERMES_QUIET: string;
	export const FPATH: string;
	export const TERMINAL_ENV: string;
	export const VISION_TOOLS_DEBUG: string;
	export const COLOR: string;
	export const MOA_TOOLS_DEBUG: string;
	export const npm_config_noproxy: string;
	export const npm_config_local_prefix: string;
	export const TERMINAL_CONTAINER_PERSISTENT: string;
	export const USER: string;
	export const WEB_TOOLS_DEBUG: string;
	export const COMMAND_MODE: string;
	export const npm_config_globalconfig: string;
	export const SSH_AUTH_SOCK: string;
	export const IMAGE_TOOLS_DEBUG: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const WARP_SSH_REUSE_CONTROL_MASTER: string;
	export const WARP_IS_LOCAL_SHELL_SESSION: string;
	export const npm_execpath: string;
	export const TERMINAL_DOCKER_EXTRA_ARGS: string;
	export const WARP_USE_SSH_WRAPPER: string;
	export const TERMINAL_SINGULARITY_IMAGE: string;
	export const PATH: string;
	export const npm_package_json: string;
	export const _: string;
	export const LaunchInstanceID: string;
	export const npm_config_userconfig: string;
	export const npm_config_init_module: string;
	export const HERMES_REDACT_SECRETS: string;
	export const BROWSERBASE_ADVANCED_STEALTH: string;
	export const __CFBundleIdentifier: string;
	export const npm_command: string;
	export const TERMINAL_DAYTONA_IMAGE: string;
	export const PWD: string;
	export const npm_lifecycle_event: string;
	export const EDITOR: string;
	export const npm_package_name: string;
	export const TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE: string;
	export const LANG: string;
	export const WARP_FOCUS_URL: string;
	export const npm_config_npm_version: string;
	export const HERMES_INTERACTIVE: string;
	export const XPC_FLAGS: string;
	export const TERMINAL_TIMEOUT: string;
	export const TERMINAL_MODAL_IMAGE: string;
	export const TERMINAL_DOCKER_IMAGE: string;
	export const npm_config_node_gyp: string;
	export const TERMINAL_CONTAINER_MEMORY: string;
	export const npm_package_version: string;
	export const TERMINAL_CWD: string;
	export const XPC_SERVICE_NAME: string;
	export const SHLVL: string;
	export const HOME: string;
	export const HOMEBREW_PREFIX: string;
	export const npm_config_cache: string;
	export const LOGNAME: string;
	export const npm_lifecycle_script: string;
	export const TERMINAL_HOME_MODE: string;
	export const LC_CTYPE: string;
	export const BROWSERBASE_PROXIES: string;
	export const SSH_SOCKET_DIR: string;
	export const BUN_INSTALL: string;
	export const npm_config_user_agent: string;
	export const HERMES_SESSION_ID: string;
	export const TERMINAL_DOCKER_RUN_AS_HOST_USER: string;
	export const TERMINAL_DOCKER_FORWARD_ENV: string;
	export const BROWSER_SESSION_TIMEOUT: string;
	export const INFOPATH: string;
	export const HOMEBREW_CELLAR: string;
	export const WARP_CLIENT_VERSION: string;
	export const OSLogRateLimit: string;
	export const TERMINAL_CONTAINER_DISK: string;
	export const CONDA_CHANGEPS1: string;
	export const HERMES_REAL_HOME: string;
	export const SECURITYSESSIONID: string;
	export const npm_node_execpath: string;
	export const npm_config_prefix: string;
	export const COLORTERM: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		TERMINAL_PERSISTENT_SHELL: string;
		TERMINAL_CONTAINER_CPU: string;
		WARP_CLI_AGENT_PROTOCOL_VERSION: string;
		TERM_PROGRAM: string;
		NODE: string;
		INIT_CWD: string;
		HERMES_KANBAN_BOARD: string;
		BROWSER_INACTIVITY_TIMEOUT: string;
		WARP_HONOR_PS1: string;
		TERM: string;
		SHELL: string;
		TERMINAL_LIFETIME_SECONDS: string;
		HOMEBREW_REPOSITORY: string;
		TMPDIR: string;
		npm_config_global_prefix: string;
		WARP_PROMPT_NODE_VERSION_ENABLED: string;
		PYTHONUNBUFFERED: string;
		WARP_TERMINAL_SESSION_UUID: string;
		TERM_PROGRAM_VERSION: string;
		TERMINAL_DOCKER_VOLUMES: string;
		HERMES_QUIET: string;
		FPATH: string;
		TERMINAL_ENV: string;
		VISION_TOOLS_DEBUG: string;
		COLOR: string;
		MOA_TOOLS_DEBUG: string;
		npm_config_noproxy: string;
		npm_config_local_prefix: string;
		TERMINAL_CONTAINER_PERSISTENT: string;
		USER: string;
		WEB_TOOLS_DEBUG: string;
		COMMAND_MODE: string;
		npm_config_globalconfig: string;
		SSH_AUTH_SOCK: string;
		IMAGE_TOOLS_DEBUG: string;
		__CF_USER_TEXT_ENCODING: string;
		WARP_SSH_REUSE_CONTROL_MASTER: string;
		WARP_IS_LOCAL_SHELL_SESSION: string;
		npm_execpath: string;
		TERMINAL_DOCKER_EXTRA_ARGS: string;
		WARP_USE_SSH_WRAPPER: string;
		TERMINAL_SINGULARITY_IMAGE: string;
		PATH: string;
		npm_package_json: string;
		_: string;
		LaunchInstanceID: string;
		npm_config_userconfig: string;
		npm_config_init_module: string;
		HERMES_REDACT_SECRETS: string;
		BROWSERBASE_ADVANCED_STEALTH: string;
		__CFBundleIdentifier: string;
		npm_command: string;
		TERMINAL_DAYTONA_IMAGE: string;
		PWD: string;
		npm_lifecycle_event: string;
		EDITOR: string;
		npm_package_name: string;
		TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE: string;
		LANG: string;
		WARP_FOCUS_URL: string;
		npm_config_npm_version: string;
		HERMES_INTERACTIVE: string;
		XPC_FLAGS: string;
		TERMINAL_TIMEOUT: string;
		TERMINAL_MODAL_IMAGE: string;
		TERMINAL_DOCKER_IMAGE: string;
		npm_config_node_gyp: string;
		TERMINAL_CONTAINER_MEMORY: string;
		npm_package_version: string;
		TERMINAL_CWD: string;
		XPC_SERVICE_NAME: string;
		SHLVL: string;
		HOME: string;
		HOMEBREW_PREFIX: string;
		npm_config_cache: string;
		LOGNAME: string;
		npm_lifecycle_script: string;
		TERMINAL_HOME_MODE: string;
		LC_CTYPE: string;
		BROWSERBASE_PROXIES: string;
		SSH_SOCKET_DIR: string;
		BUN_INSTALL: string;
		npm_config_user_agent: string;
		HERMES_SESSION_ID: string;
		TERMINAL_DOCKER_RUN_AS_HOST_USER: string;
		TERMINAL_DOCKER_FORWARD_ENV: string;
		BROWSER_SESSION_TIMEOUT: string;
		INFOPATH: string;
		HOMEBREW_CELLAR: string;
		WARP_CLIENT_VERSION: string;
		OSLogRateLimit: string;
		TERMINAL_CONTAINER_DISK: string;
		CONDA_CHANGEPS1: string;
		HERMES_REAL_HOME: string;
		SECURITYSESSIONID: string;
		npm_node_execpath: string;
		npm_config_prefix: string;
		COLORTERM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
