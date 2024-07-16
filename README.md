# Knowledge Source as Code

KSaC (Knowledge Source as Code) is a CLI tool that allows you to manage your knowledge sources as code. It uses the same principles as Infrastructure as Code (IaC) tools like Terraform, but for managing your knowledge sources. Many concepts are inspired from IaC like the usage of HCL for definitions and the subcommands available.

### DISCLAIMER

**This project is not affiliated with, sponsored by, or endorsed by [StackSpot](https://stackspot.com/). [StackSpot](https://stackspot.com/) is a registered trademark of [Zup Innovation](https://www.zupinnovation.com/).**

## Features

- **HCL Definitions**: Define your knowledge sources and knowledge objects using HCL.
- **Validation**: Validate your HCL definitions before applying them.
- **Plan**: See the changes that will be made by KSaC before applying them.
- **Apply**: Apply the changes to the StackSpot resources so your Knowledge Sources match the definitions.
- **Destroy**: Destroy the resources defined in the definitions.
- Organize your Knowledge Sources and Knowledge Objects in a structured way, using directories.
- Keep the history of your changes in a version control system.
- Create a pipeline to apply the changes automatically.
- Use Pull Requests for a review process before applying the changes.

## Installation

### Windows, Linux and MacOS **via NPM**

First, make sure you have Node.js and NPM installed, to verify run:

```bash
npm -v
```

If you don't have NodeJS installed, you can download it from [here](https://nodejs.org/).

Then, you can install KSaC using NPM, **you might need sudo for Linux and Mac**:

```bash
npm install -g ksac
```

Alternatively, with sudo for Linux and Mac:

```bash
sudo npm install -g ksac
```

Check the installation with the `--help` flag:

```bash
$ ksac --help
Usage: ksac [options] [command]

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  validate [options]  Checks the KSaC definitions for errors or warnings
  plan [options]      Shows the changes that will be made by the KSaC definitions
  apply [options]     Apply changes to the StackSpot resources so they match the KSaC definitions
  destroy [options]   Destroys the resources defined in the KSaC definitions
  help [command]      display help for command
```


# DISCLAIMER

**This project is not affiliated with, sponsored by, or endorsed by [StackSpot](https://stackspot.com/). [StackSpot](https://stackspot.com/) is a registered trademark of [Zup Innovation](https://www.zupinnovation.com/).**

# ISENÇÃO DE RESPONSABILIDADE

**Este projeto não é afiliado, patrocinado ou endossado pela [StackSpot](https://stackspot.com/). [StackSpot](https://stackspot.com/) é uma marca registrada da [Zup Innovation](https://www.zupinnovation.com/).**
