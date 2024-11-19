# Ionic React Application

This is an Ionic React application built using the Ionic framework and React for cross-platform mobile and web applications. The app supports both Android, iOS, and web platforms.

Getting Started

Ensure you have the following installed on your local development environment:

•	Node.js: LTS version (preferably v16+) https://nodejs.org/en

•	npm: Comes with Node.js. Recommended version: 6.x or higher

•	Ionic CLI: You can install the Ionic CLI globally by running: https://ionicframework.com/docs/cli

npm install -g @ionic/cli




## Installation

To install the project dependencies, run the following command:

•	npm install

This command will install all the required dependencies specified in package.json.





## Starting the Development Server

To start the Ionic app in development mode, use the following command:

•	Modify `src/environments/environment.ts` to include your python backend URL and API key.
•	ionic serve --proxy-config proxy.conf.json

This will start a local development server that will open the application in your browser. The app will be served by default at http://localhost:8100.





## Production Build

Serving this application in production is based on building it as docker container. In this docker container it uses `envsubst` nginx module to handle multiple environment deploymend via environment variables. `API_ENDPOINT` and `API_KEY` when provided, will be replaced on running the container. 
### Local test container
The `API_KEY` value is stored in AWS Secrets Manager in the stallions/optimus_prime_se/webapp secret. Replace it in the command below:
```bash
docker build -t optimus:local .
docker run -ti -p 8000:80 -e API_ENDPOINT="genai-optimus-api.cirrus-dev.teliacompany.net/api/v1" -e API_KEY="XXXX" optimus:local
```


## Further Documentation
For more details check this https://itwiki.atlassian.teliacompany.net/display/AI/GUI
