<div align="center">

# Wrangler Config

[![Node CI](https://github.com/BetaHuhn/wrangler-config/workflows/Node%20CI/badge.svg)](https://github.com/BetaHuhn/wrangler-config/actions?query=workflow%3A%22Node+CI%22) [![Release CI](https://github.com/BetaHuhn/wrangler-config/workflows/Release%20CI/badge.svg)](https://github.com/BetaHuhn/wrangler-config/actions?query=workflow%3A%22Release+CI%22) [![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/BetaHuhn/wrangler-config/blob/master/LICENSE) ![David](https://img.shields.io/david/betahuhn/wrangler-config)

Interactive setup and deployment of pre-made CloudFlare Workers

</div>

## 👋 Introduction

While `wrangler generate` is meant to generate a completely new worker from an existing template, `wrangler-config` is meant to setup a pre-made Worker like [cf-worker-redirect](https://github.com/BetaHuhn/cf-worker-redirect).

The basic wrangler configuration, required KV Namespaces and Environment variables are stored in `workerConfig.toml` file. When a user wants to setup your Worker, they can simply run `wrangler-config setup` and they will be guided through the process of setting up and deploying the Worker. Required KV Namespaces are automatically created and the user is asked to input all required Environment variables.

## 🚀 Get started

Install [wrangler-config](https://github.com/BetaHuhn/wrangler-config) via npm:

```shell
npm install wrangler-config
```

Start the setup process:

```shell
wrangler-config setup
```

> Requires a local workerConfig.toml file

## 📚 Usage

```
wrangler-config generate
```

Will use a local `workerConfig.toml` and environment variables/.env file to generate a `wrangler.toml`

---

```
wrangler-config setup
```

Will start interactive setup process. Required KV Namespaces are automatically created and the user is asked to input all required Environment variables. The final `wrangler.toml` will be generated from the template.

## ⚙️ Configuration

1) Create a `wranglerConfig.toml` file, fill it with the options you would normally put into `wrangler.toml`

2) Add `wrangler.toml` to your `.gitignore` file

3) Specify the bindings for required KV Namespaces:

```toml
kv_namespaces = [ "KV_NAMESPACE_EXAMPLE" ]
```

4) Specify required Environment Variables/Secrets:

```toml
environment_variables= [ "SECRET_EXAMPLE" ]
```

## Example intructions for your README

Ensure you have [`wrangler`](https://github.com/cloudflare/wrangler) installed and configured.

Clone this repo and cd into it:

```shell
git clone https://github.com/betahuhn/cf-worker-redirect && cd cf-worker-redirect
```

Next start the interactive setup process:

```shell
wrangler-config setup
```

You will be asked to input a few values specific to your CloudFlare Account and the Worker will be deployed.

You can also manually publish the Worker with:

```shell
wrangler-config publish
```

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
