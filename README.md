# Ask Around Me - Get your questions answered by local users

This example application shows how to build a serverless web application including features like authentication, geohashing and realtime messaging.

To learn more about how this application works, see the 3-part series on the AWS Compute Blog:
- Part 1: https://aws.amazon.com/blogs/compute/building-a-location-based-scalable-serverless-web-app-part-1/.
- Part 2: https://aws.amazon.com/blogs/compute/building-a-location-based-scalable-serverless-web-app-part-2/.
- Part 3: https://aws.amazon.com/blogs/compute/building-a-location-based-scalable-serverless-web-app-part-3/.

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

```bash
.
├── README.MD                   <-- This instructions file
├── backend                     <-- Source code for the serverless backend
├── frontend                    <-- Source code for the Vue.js frontend
```

## Requirements

* AWS CLI already configured with Administrator permission
* [AWS SAM CLI installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - minimum version 0.48.
* [NodeJS 12.x installed](https://nodejs.org/en/download/)
* [Vue.js and Vue CLI installed](https://vuejs.org/v2/guide/installation.html)
* [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key)
* Sign up for an [Auth0 account](https://auth0.com/)

## Installation Instructions

1. [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and login.

2. Clone the repo onto your local development machine using `git clone`.

### Installing the realtime stack

1. From the command line, install the realtime messaging stack:
```
cd backend
sam deploy --guided --template-file realtime.yaml
```
During the prompts, enter `askAroundMe-realtime` for the Stack Name, enter your preferred Region, and accept the defaults for the remaining questions. 

2. Retrieve the IoT endpointAddress - note this for the frontend installation:
```
aws iot describe-endpoint --endpoint-type iot:Data-ATS
```
3. Retrieve the Cognito Pool ID - note this for the frontend installation:
```
aws cognito-identity list-identity-pools --max-results 10
```

### Installing the DynamoDB geohash library

1. From the command line, setup the dynamodb-geo library and DynamoDB table:
```
cd setup
npm install
node ./setup.js <<REGION>>
```
Replace `<<REGION>>` with your preferred AWS Region (e.g. us-east-1)

This process takes up to 1 minute to complete. 

2. After this, retrieve the DynamoDB StreamArn value for the next part of the installation, using the following command:
```
aws dynamodbstreams list-streams --table-name aamQuestions
```

### Installing the backend application

From the command line, deploy the SAM template. Note that your SAM version must be at least 0.48 - if you receive build errors, it is likely that your SAM CLI version is not up to date. 
Run:

```
cd .. 
sam build
sam deploy --guided
```

When prompted for parameters, enter:
- Stack Name: askAroundMe-backend
- AWS Region: your preferred AWS Region (e.g. us-east-1)
- QuestionsTableName: leave as default
- QuestionsTableStreamARN: enter the stream ARN you noted in the last section. 
- AnswersTableName: leave as default
- IoTDataEndpoint: the IoT endpointAddress noted in the realtime stack installation.
- Auth0issuer: this is the URL for the Auth0 account (the format is https://dev-abc12345.auth0.com/).
- Accept all other defaults.

This takes several minutes to deploy. At the end of the deployment, note the `APIendpoint` value, as you need this in the frontend installation.

### Installing the frontend application

The frontend code is saved in the `frontend` subdirectory. 

1. Before running, you need to set environment variables in the `src\main.js` file:

- GoogleMapsKey: [sign up](https://developers.google.com/maps/documentation/javascript/get-api-key) for a Google Maps API key and enter the value here.
- APIurl: this is the `APIendpoint` value from the last section.
- PoolId: your Cognito pool ID from earlier.
- Host: your IoT endpoint from earlier.
- Region: your preferred AWS Region (e.g. us-east-1).

2. Open the `frontend\auth_config.json` and enter the values from your Auth0 account:
- domain: this is your account identifier, in the format `dev-12345678.auth0.com`.
- clientId: a unique string identifying the client application.
- audience: set to https://auth0-jwt-authorizer.

3. Change directory into the frontend code, and run the NPM installation:

```
cd ../frontend
npm install
```
4. After installation is complete, you can run the application locally:

```
npm run build
```
## Next steps

The AWS Compute Blog series and video link at the top of this README file contains additional information about the application design and architecture.

If you have any questions, feel free to DM the [author on Twitter](https://twitter.com/jbesw) or raise an issue in the GitHub repo.

==============================================

Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0
