<a  href="https://www.twilio.com">
<img  src="https://d3k2f0s3vqqs9o.cloudfront.net/media/final/6aee06b2-21a8-4613-9c70-9441dca13d2c/webimage-C8DB9280-3BDD-432D-AD472E92F7CE3D11.png"  alt="Powered by Twilio" width="300"/>

# Twilio Dynamic Provider for Pulumi

This is an experimental Twilio Dynamic Provider for Pulumi. The goal of this repository is to show how Twilio projects could be described as code and used in a CI/CD pipeline.

## How to Use

### Pulumi CLI

First, you need to [install the Pulumi CLI](https://www.pulumi.com/docs/reference/cli/) on your machine. You will need the Pulumi CLI to test your code.

After installing the CLI, you need to login using `pulumi login`. By default, this will log you in to the managed Pulumi service backend. If you prefer to log in to a self-hosted service backend, specify a URL. For more information, please refer to the [pulumi login reference page](https://www.pulumi.com/docs/reference/cli/pulumi_login/).  Also, check the `State and Backends` section to understand how states are handled.

### Install NPM Package

To install via npm, run:

```
npm install twilio-pulumi-provider
```

Also, this package has Pulumi as a `peerDependency` so you can use other providers in your code. To install, just run:

```
npm install @pulumi/pulumi
```

### Learning from Examples

For a list of repository templates that show you how to use Pulumi for deploying your Twilio projects, see the [Examples repo](https://github.com/twilio-infra-as-code/examples).


## More about the project


### Twilio

[Twilio](https://www.twilio.com/) powers the future of business communications by enabling phones, VoIP, and messaging to be embedded into web, desktop, and mobile software. Millions of developers around the world have used Twilio to unlock the magic of communications to improve any human experience. ().

### Pulumi

[Pulumi](https://www.pulumi.com) is an open source infrastructure-as-code tool for creating, deploying, and managing cloud infrastructure. Pulumi works with traditional infrastructure like VMs, networks, and databases, in addition to modern architectures, including containers, Kubernetes clusters, and serverless functions.

Key Pulumi concepts you should be familiar with before using this provider are:

- [Stack](https://www.pulumi.com/docs/intro/concepts/stack/)
- [Configurations](https://www.pulumi.com/docs/intro/concepts/config/) and [secrets](https://www.pulumi.com/docs/intro/concepts/secrets/)
- [State](https://www.pulumi.com/docs/intro/concepts/state/0

#### Dynamic Provider

There are different ways of creating providers inside Pulumi but for this project, we chose to implement it as a Dynamic Provider using Node.js which integrates with the official Twilio Node.js SDK. For more information, please read [Intro to Infrastructure as Code with Twilio](https://www.twilio.com/blog/intro-to-infrastructure-as-code-with-twilio-part-1) and [Pulumi Dynamic Providers](https://www.pulumi.com/blog/dynamic-providers/).
