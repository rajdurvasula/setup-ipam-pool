# CDK TypeScript project - IPAM automation project

This is a project build with CDK development. Language is TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Purpose
- Setup IPAM on Shared Network Account
- Setup IPAM pools

- Regions:
  - eu-north-1
  - ca-central-1
  - ap-south-1
  - ap-southeast-2
  - eu-west-1
  - eu-west-3
  - us-east-2
  - us-west-2
  - ap-northeast-2
  - ap-southeast-1
  - eu-central-1
  - ap-northeast-1
  - sa-east-1
  - eu-west-2
  - us-east-1

## IP Pools
- Main Pool
  - Name: central pool 1
  - CIDR: 10.0.0.0/8

- Regional Pools (15):
  - Name: **aws_region** pool
  - CIDR: /12

- Regional Dev Pool
  - Name: **aws_region** Dev pool
  - CIDR: /14

- Regional Prod Pool
  - Name: **aws_region** Prod pool
  - CIDR: /14

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
