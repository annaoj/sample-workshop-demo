# sample-workshop-demo 

For detailed steps, Please follow Lab 2

## Local Environment Setup

In a terminal on your local machine, navigate to the repository root directory and run...

```
npm install
```

## Configuring Demo Credentials

In order for the demos to leverage the Cognito credentials you set up in the **Prerequisites** section you'll need to make the following edit...

Open the `src/demo-credentials.js` file editing.

Set the `cognitoIdentityPoolId` value to the Cognito Identity Pool you previously created. 

Save the edits you made to the `demo-credentials.js` file.

Your sample code credential setup is now complete! 🎉

## Running the Demos Locally

In a terminal, navigate to repository root directory.

Start the demo server by running...

```
npm run start
```
This starts a local web server and launches two new browser tabs. The tab that will have focus will be titled **"BabylonJS Sumerian Host Demos"**. Click on any demo to give it a try.

When you're finished with the demos, you can quit the local dev server by pressing CTRL-C in the same terminal in which you started the server.

## Deploying the Demos to a Web Server

If you'd like to deploy the demos to a web server so that others can access them follow the steps below.

Run the following command which will build a deployable version of the web application.

```
npm run build
```

The command above outputs the deployable files to a "dist" folder. Deploy all the files inside the "dist" folder to your web server.

# References: 

This demo is built based on https://github.com/Krxtopher/sumerian-host-demos-babylonjs
