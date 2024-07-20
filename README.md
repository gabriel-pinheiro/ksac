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
  login               Set the credentials to access the StackSpot AI API
  validate [options]  Checks the KSaC definitions for errors or warnings
  plan                Shows the changes that will be made by the KSaC definitions
  apply               Apply changes to the StackSpot resources so they match the KSaC definitions
  destroy             Destroys the resources defined in the KSaC definitions
  logout              Remove the saved credentials
  help [command]      display help for command
```

## Getting Started

### 1. Creating your first Knowledge Source as Code

Start by creating a folder where you will store your KSaC definitions. Inside this folder, you can create files with the `.hcl` extension to define your Knowledge Sources and Knowledge Objects. The files can be organized in directories to any level of depth.

You can store multiple knowledge sources in the same file, or split them into multiple files. When running `ksac` commands it'll read all the `.hcl` files in the current directory and its subdirectories.

Here's an example of a simple KSaC definition:

```hcl
knowledge_source "cats" {
    name        = "Cats"
    description = "A knowledge source about cats"

    knowledge_object "george" {
        content = "George is an orange cat that loves to sleep in the sun"
    }

    knowledge_object "molly" {
        content = "Molly is a black cat that loves to play with toys"
    }
}
```

### 2. Validating your definitions

Before applying your definitions, you can validate them to check for errors or warnings. This is an optional step, both `ksac plan` and `ksac apply` will also validate the definitions before running, but they required authentication while `ksac validate` does not.

To do this, run the `ksac validate` command:

```bash
ksac validate
```

![Example of ksac validate](https://cdn.codetunnel.net/notnull/ksac-validate.png)

### 3. Authenticating with StackSpot

Before applying your definitions, you need to authenticate with StackSpot. If you're using a community account, you can use [Personal Access Tokens](https://app.stackspot.com/account/access-token). If you're using an enterprise account, you can use either [Personal Access Tokens](https://app.stackspot.com/account/access-token) or [Service Accounts](https://app.stackspot.com/account/service-credentials).

After generating your credentials in the links above, you can authenticate with KSaC using the `ksac login` command and fill in the required information.

```bash
ksac login
```

![Example of ksac login](https://cdn.codetunnel.net/notnull/ksac-login.png)

### 4. Generating an execution plan

Before applying the changes, you can generate an execution plan to see what changes will be made. This is a dry-run that will not make any changes to your knowledge sources but will tell you how your StackSpot resources differ from your definitions and what KSaC will do to make them match.

This step is also optional and running `ksac apply` will also generate and show the plan before applying the changes.

To do this, run the `ksac plan` command:

```bash
ksac plan
```

![Example of ksac plan](https://cdn.codetunnel.net/notnull/ksac-plan.png)

### 5. Applying the changes

For your next Knowledge Sources you could skip from step 1 to step 5, as your authentication information will be saved and `ksac apply` also validates and plan the changes.

To apply the changes to your StackSpot account, run the `ksac apply` command:

```bash
ksac apply
```

After this, you can check your StackSpot panel to see the changes made. Running `ksac plan` or `ksac apply` again will show that there are no changes to be made, as your definitions and your StackSpot resources are in sync.

![Example of ksac apply](https://cdn.codetunnel.net/notnull/ksac-apply.png)

### 6. Destroying the resources

If you want to destroy all the resources you defined, you can run the `ksac destroy` command. KSaC will never delete a Knowledge Source with `ksac apply` so `ksac destroy` is the only way to remove Knowledge Sources via KSaC. Knowledge Objects will be deleted if they are not present in the definitions with `ksac apply`.

```bash
ksac destroy
```

This is not as destructive as it seems, as you can always reapply the definitions with `ksac apply` to recreate the resources to the same state as your definitions.

![Example of ksac destroy](https://cdn.codetunnel.net/notnull/ksac-destroy.png)

### 7. Troubleshooting

If you have any issues with KSaC, you can run the commands with the environment variable `DEBUG` set to `ksac:*` to get more information about what's happening. For example:

On Linux:
```bash
DEBUG=ksac:* ksac apply
```

On Windows:
```bash
npx cross-env "DEBUG=ksac:*" ksac apply
```

<details>
  <summary>Example output</summary>
  <img src="https://cdn.codetunnel.net/notnull/ksac-debug.png" alt="Example of ksac debug">
</details>

---

Also, you can generate the "desired state" with the `--show` flag in the `ksac validate` command. This will show the desired state of your definitions, which is the state that KSaC will try to make your StackSpot resources match.

Spoiler:

```bash
ksac validate --show
```

<details>
  <summary>Example output</summary>
  <img src="https://cdn.codetunnel.net/notnull/ksac-show.png" alt="Example of ksac show">
</details>

### 8. More HCL examples

The definition shown above is a simple example. You can define more complex Knowledge Sources and Knowledge Objects. Here is a commented example with some of the available options:

```hcl
// You can always comment your HCL files with double slashes

// You can define multiple knowledge sources in the same file or split them into multiple files
knowledge_source "cats" {
    name        = "Cats"
    description = "A knowledge source about cats"

    knowledge_object "george" {
        content = "George is an orange cat that loves to sleep in the sun"

        // You can define use cases to help in the similarity search
        use_cases = ["George preferences, habits and characteristics"]

        // The default language is markdown but you can change that if your
        // content is in another language, like code snippets or queries
        language = "markdown"
    }

    knowledge_object "molly" {
        // You can use the following syntax for multi-line content
        content = <<EOF
Molly is a black cat that loves to play with toys.
She is very active and loves to run around the house.
Molly recently learned how to open doors.
EOF

        use_cases = [
            "Molly preferences, habits and characteristics",
            "Molly's toys and activities"
        ]
    }
}
```

# DISCLAIMER

**This project is not affiliated with, sponsored by, or endorsed by [StackSpot](https://stackspot.com/). [StackSpot](https://stackspot.com/) is a registered trademark of [Zup Innovation](https://www.zupinnovation.com/).**

# ISENÇÃO DE RESPONSABILIDADE

**Este projeto não é afiliado, patrocinado ou endossado pela [StackSpot](https://stackspot.com/). [StackSpot](https://stackspot.com/) é uma marca registrada da [Zup Innovation](https://www.zupinnovation.com/).**
