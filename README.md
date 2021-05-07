<div align="center">

# Worker Setup

[![Node CI](https://github.com/BetaHuhn/worker-setup/workflows/Node%20CI/badge.svg)](https://github.com/BetaHuhn/worker-setup/actions?query=workflow%3A%22Node+CI%22) [![Release CI](https://github.com/BetaHuhn/worker-setup/workflows/Release%20CI/badge.svg)](https://github.com/BetaHuhn/worker-setup/actions?query=workflow%3A%22Release+CI%22) [![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/BetaHuhn/worker-setup/blob/master/LICENSE) ![David](https://img.shields.io/david/betahuhn/worker-setup)

Interactive setup and deployment of pre-made CloudFlare Workers

</div>

## 👋 Introduction

While `wrangler generate` is meant to generate a completely new worker from an existing template, `worker-setup` is meant to setup a pre-made Worker like [cf-worker-redirect](https://github.com/BetaHuhn/cf-worker-redirect).

The basic wrangler configuration, required KV Namespaces, secrets and environment variables are stored in the `workerConfig.toml` file. When a user wants to setup your Worker, they can simply run `worker-setup deploy` and they will be guided through the process of logging in to their account, setting up and deploying the Worker. Required KV Namespaces are automatically created and the user is asked to input all required secrets and environment variables.

## ⭐ Features

- Generates ready-to-use wrangler.toml file filled with user specific values like Account/Zone/KV Namespace ID
- Installs and configures [Wrangler](https://github.com/cloudflare/wrangler) (Including authenticating with CloudFlare)
- Automatically creates required KV Namespaces
- Prompts the user for required Secrets and Environment Variables (and uploads them)
- Lets the user choose between deploying to [workers.dev](https://workers.dev) or a custom Zone
- Can dynamicly fill wrangler.toml with user specific values using environment variables (useful for CI)

## 🚀 Get started

Install [worker-setup](https://github.com/BetaHuhn/worker-setup) via npm:

```shell
npm install worker-setup
```

See [below](#%EF%B8%8F-configuration) on how to configure [worker-setup](https://github.com/BetaHuhn/worker-setup) for your own Worker.

## 📚 Usage

Run `worker-setup help` to see all available commands and options.

Here's an overview of the available commands:

### Deploy

```
worker-setup deploy
```

Will start the interactive deployment process. You will be asked to login with CloudFlare if not already logged in. Required KV Namespaces are automatically created and you are asked to input all required secrets and environment variables. The final `wrangler.toml` will be generated from the template.

### Generate

```
worker-setup generate
```

Will use a local `workerConfig.toml` and environment variables/.env file to generate a `wrangler.toml` (useful for CI purposes).

### Login

```
worker-setup login
```

Will authenticate Wrangler with CloudFlare, either via the browser or by specifying an API token.

### Migrate

```
worker-setup migrate
```

Will migrate your old `wrangler.toml` to a new `workerConfig.toml` by removing all personal fields, like account/zone id as well as the ids for kv_namespaces and values for environment variables and adding `wrangler.toml` to your `.gitignore` file. All other options will be transfered to the new config.

## 🛠️ Setup

[worker-setup](https://github.com/BetaHuhn/worker-setup) uses a `workerConfig.toml` file which replaces your normal `wrangler.toml`. It supports everything you normally put into your `wrangler.toml` file as well as more (see below).

If you have an existing `wrangler.toml`, run the following to generate a new `workerConfig.toml` from your config:

```shell
worker-setup migrate
```

If not, create a new `workerConfig.toml` file and fill it with your normal [Wrangler configuration options](https://developers.cloudflare.com/workers/cli-wrangler/configuration) manually.

If your Worker uses Workers KV or requires secrets/environment variables add the binding/keys as well.

When you run `worker-setup deploy`, [worker-setup](https://github.com/BetaHuhn/worker-setup) will use the `workerConfig.toml` file to know what your Worker needs and asks the user to input the required values, as well as create the required KV Namespaces. Once everything is done, it will output a normal `wrangler.toml` file and deploy the worker with [`wrangler`](https://github.com/cloudflare/wrangler).

## ⚙️ Configuration

The `workerConfig.toml` file supports the following [configuration options](https://developers.cloudflare.com/workers/cli-wrangler/configuration):

| Key | Description | Required |
| ------------- | ------------- | ------------- |
| `name` | The default name of your Worker (can be changed by the user during setup) | **Yes** |
| `type` | Specifies how `wrangler build` will build your project. | **Yes** |
| `webpack_config` | This is the path to a custom webpack configuration file for your worker. | **No** |
| `site` | Determines the local folder to upload and serve from a Worker | **No** |
| `usage_model` | Specifies the [Usage Model](https://developers.cloudflare.com/workers/platform/pricing#usage-models) for your Worker. | **No** |
| `​triggers` | Configures cron triggers for executing a Worker on a schedule | **No** |
| `dev` | Arguments for `wrangler dev`, configure local server | **No** |
| `​build` | Allows configuring a custom build step to be run by wrangler when building your worker. | **No** |

> See [wrangler's docs](https://developers.cloudflare.com/workers/cli-wrangler/configuration) for more info on each option.

As well as these additional options:

| Key | Description | Required | Example |
| ------------- | ------------- | ------------- | ------------- |
| `kv_namespaces` | Specify the required KV namespace bindings (will be created during setup) | **No** | `[ "EXAMPLE_KV" ]` |
| `secrets` | Specify the required secrets (user will be asked to input during setup) | **No** | `[ "EXAMPLE_SECRET" ]` |
| `variables` | Specify the required plain-text variables (user will be asked to input during setup) | **No** | `[ "EXAMPLE_VARIABLE" ]` |
| `recommended_route` | A recommended route to be used with the Worker (will be shown to user) | **No** | `"*example.com/test"` |


## 📖 Examples

Here are a few examples to help you get started!

## 📝 Intructions for your README

Here are example intructions you can use in the README for your Worker:

---

Clone this repo and cd into it:

```shell
git clone https://github.com/betahuhn/cf-worker-redirect && cd cf-worker-redirect
```

Next start the interactive deployment process:

```shell
worker-setup deploy
```

You will be asked to login to CloudFlare if not already authenticated. The programm will guide you through the process of setting up and deploying the Worker.

---

## 💻 Development

- run `yarn lint` or `npm run lint` to run eslint.
- run `npm link` to setup the program for development.
- run `yarn build` or `npm run build` to produce a compiled version in the `dist` folder.

## ❔ About

This project was developed by me ([@betahuhn](https://github.com/BetaHuhn)) in my free time. If you want to support me:

[![Donate via PayPal](https://img.shields.io/badge/paypal-donate-009cde.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=394RTSBEEEFEE)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F81S2RK)

## 📄 License

Copyright 2021 Maximilian Schiller

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
