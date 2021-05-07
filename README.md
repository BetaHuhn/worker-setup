<div align="center">

# Worker Setup

[![Node CI](https://github.com/BetaHuhn/worker-setup/workflows/Node%20CI/badge.svg)](https://github.com/BetaHuhn/worker-setup/actions?query=workflow%3A%22Node+CI%22) [![Release CI](https://github.com/BetaHuhn/worker-setup/workflows/Release%20CI/badge.svg)](https://github.com/BetaHuhn/worker-setup/actions?query=workflow%3A%22Release+CI%22) [![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/BetaHuhn/worker-setup/blob/master/LICENSE) ![David](https://img.shields.io/david/betahuhn/worker-setup)

Interactive setup and deployment of pre-made CloudFlare Workers

</div>

## 👋 Introduction

While `wrangler generate` is meant to generate a completely new worker from an existing template, `worker-setup` is meant to setup a pre-made Worker like [cf-worker-redirect](https://github.com/BetaHuhn/cf-worker-redirect).

The basic wrangler configuration, required KV Namespaces, secrets and environment variables are stored in the `workerConfig.toml` file. When a user wants to setup your Worker, they can simply run `worker-setup start` and they will be guided through the process of setting up and deploying the Worker. Required KV Namespaces are automatically created and the user is asked to input all required secrets and environment variables.

## 🚀 Get started

Install [worker-setup](https://github.com/BetaHuhn/worker-setup) via npm:

```shell
npm install worker-setup
```

See [below]() on how to configure [worker-setup](https://github.com/BetaHuhn/worker-setup) for your own Worker.

## 📚 Usage

```
worker-setup start
```

Will start the interactive setup process. Required KV Namespaces are automatically created and the user is asked to input all required secrets and environment variables. The final `wrangler.toml` will be generated from the template.

---

```
worker-setup generate
```

Will use a local `workerConfig.toml` and environment variables/.env file to generate a `wrangler.toml` (useful for CI purposes).

## 🛠️ Setup

[worker-setup](https://github.com/BetaHuhn/worker-setup) uses a `wranglerConfig.toml` file which replaces your normal `wrangler.toml`. It supports everything you normally put into your `wrangler.toml` file as well as more (see below).

To start using [worker-setup](https://github.com/BetaHuhn/worker-setup) you have to create the `wranglerConfig.toml` file and add your old `wrangler.toml` to your `.gitignore` file.

Put any options you would normally store in the `wrangler.toml`, like the name, type, webpack_config into it instead.

If your Worker uses Workers KV, specify all required KV Namspaces:

```toml
kv_namespaces = [ "KV_NAMESPACE_EXAMPLE" ]
```

If your Worker requires any secrets, specify them as well:

```toml
secrets = [ "SECRET_EXAMPLE" ]
```

The same for plain-text environment variables:

```toml
variables = [ "VAR_EXAMPLE" ]
```

When you run `worker-setup start`, [worker-setup](https://github.com/BetaHuhn/worker-setup) will use `wranglerConfig.toml` to know what your Worker needs and ask the user to input the required values as well create the required KV Namespaces. Once everything is done, it will output a normal `wrangler.toml` file and deploy the worker with [`wrangler`](https://github.com/cloudflare/wrangler).

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

Ensure you have [`wrangler`](https://github.com/cloudflare/wrangler) installed and configured.

Clone this repo and cd into it:

```shell
git clone https://github.com/betahuhn/cf-worker-redirect && cd cf-worker-redirect
```

Next start the interactive setup process:

```shell
worker-setup start
```

You will be asked to input a few values specific to your CloudFlare Account and the programm will guide through the process of deploying the Worker.

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
