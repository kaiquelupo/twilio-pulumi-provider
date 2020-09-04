# Twilio Dynamic Provider for Pulumi

Experimental Twilio Dynamic Provider for Pulumi. The goal of this repository is to show how Twilio projects could be described as code and used in a CI/CD pipeline.

## How to Use

### Pulumi CLI

First, you need to install the Pulumi CLI in your system. This CLI will be needed to test your code. Please refer to this [link](https://www.pulumi.com/docs/reference/cli/). 

After installing the CLI, you need to login using `pulumi login`. By default, this will log in to the managed Pulumi service backend. If you prefer to log in to a self-hosted Pulumi service backend, specify a URL. For more information, please refer to this [link](https://www.pulumi.com/docs/reference/cli/pulumi_login/).  Also, check the `State and Backends` section to understand how states are handled.

### Install NPM Package

You can install using npm:

```
npm install twilio-pulumi-provider
```

### Learning from Example

Now that you have all installed, you can learn how to use the package to build your infrastructure as code project through this [example implementation](https://github.com/kaiquelupo/twilio-pulumi-provider-example).


## More about the project


## Twilio

Twilio powers the future of business communications. Enabling phones, VoIP, and messaging to be embedded into web, desktop, and mobile software. Millions of developers around the world have used Twilio to unlock the magic of communications to improve any human experience. For more information, please refer to this [link](https://www.twilio.com/).

## Pulumi

Pulumi is an open source infrastructure as code tool for creating, deploying, and managing cloud infrastructure. Pulumi works with traditional infrastructure like VMs, networks, and databases, in addition to modern architectures, including containers, Kubernetes clusters, and serverless functions.

Pulumi uses real languages for infrastructure as code, which means many benefits: IDEs, abstractions including functions, classes, and packages, existing debugging and testing tools, and more. The result is greater productivity with far less copy and paste, and it works the same way no matter which cloud you're targeting.

For more information, please refer to this [link](https://www.pulumi.com/docs/intro/concepts/)

### Stack

Every Pulumi program is deployed to a stack. A stack is an isolated, independently configurable instance of a Pulumi program. Stacks are commonly used to denote different phases of development (such as development, staging and production) or feature branches (such as feature-x-dev, jane-feature-x-dev). For more information, please refer to this [link](https://www.pulumi.com/docs/intro/concepts/stack/).

In our project, we are considering that each git branch is a stack. For more information, please refer to this [link](https://www.pulumi.com/docs/intro/concepts/organizing-stacks-projects/).

### Configuration and Secrets

As we are considering that each branch is a stack, we can handle the environment variables as such following this [documentation](https://www.pulumi.com/docs/intro/concepts/stack/). However, in my opinion, secrets such as API Keys are not yet handle in a good way by Pulumi. Therefore, we are sending API Keys using `.env` file in development environment and GitHub Secrets (or similar feature) in our CI/CD environment. Check the section `How to Use` for more information.

### State and Backends

Pulumi stores its own copy of the current state of your infrastructure. This is often simply called state, and is stored in transactional snapshots we call checkpoints. A checkpoint is recorded by Pulumi at various points so that it can operate reliably — whether that means diffing goal state versus current state during an update, recovering from failure, or destroying resources accurately to clean up afterwards. Because state is critical to how Pulumi operates, we’ll cover a few of the state backend options on this page.

Pulumi supports multiple backends for storing your infrastructure state:

- The Pulumi Service backend
- A self-managed backend, either stored locally on your filesystem or remotely using a cloud storage service

For more information, check this [link](https://www.pulumi.com/docs/intro/concepts/state/).

### Dynamic Provider

There are different ways of creating providers inside Pulumi but for this project we choose to implement it as Dynamic Provider. This way is quite simple and quick to implement the Twilio Provider because you can use Node.js and integrate with the official Twilio Node.js SDK. For more information, please refer to this [link](https://www.pulumi.com/blog/dynamic-providers/). 

**Note**: it is probably better to implement a actual provider in the long term but to this repository goal, the dynamic provider is enough. Let me know about your thoughts on that! :D 