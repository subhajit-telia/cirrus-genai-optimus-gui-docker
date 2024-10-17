Ionic React Application

This is an Ionic React application built using the Ionic framework and React for cross-platform mobile and web applications. The app supports both Android, iOS, and web platforms.

Getting Started

Ensure you have the following installed on your local development environment:

•	Node.js: LTS version (preferably v16+) 

•	npm: Comes with Node.js. Recommended version: 6.x or higher

•	Ionic CLI: You can install the Ionic CLI globally by running:

npm install -g @ionic/cli




Installation

To install the project dependencies, run the following command:

•	npm install

This command will install all the required dependencies specified in package.json.





Starting the Development Server

To start the Ionic app in development mode, use the following command:

•	ionic serve

This will start a local development server that will open the application in your browser. The app will be served by default at http://localhost:8100.





Production Build

To create a production-ready build for web deployment, run:

•	ionic build --prod





Environment Variables

You can define environment-specific variables by creating .env files at the root of your project.

For example, in a .env file:

VITE_API_URL = https://genai-optimus.cirrus-dev.teliacompany.net/api




For more details check this https://itwiki.atlassian.teliacompany.net/display/AI/GUI
