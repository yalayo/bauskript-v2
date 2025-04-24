## Install dependencies
npm i

## Run the frontend
Open a terminal and run the following command:
npm run dev

## Tailwind css
Create tailwind.css, use this command to watch that file and generate the index.css:
Open a terminal and run the following command: 
npx tailwindcss -i ./ui/index.css -o ./resources/public/css/index.css --watch

## To use react components in clojurescript
Babel
Use this command to translate the jsx, tsx, ts code to js (you can adapt it later to your project)
Open a terminal and run the following command:
npx babel ../../client/src --out-dir ./js --extensions ".ts,.tsx,.jsx" --ignore "node_modules" --watch

## Access the frontend
There are three different sections. You can open each of them with the following links


## Working with storybook
Build storybook
npm run build-storybook

Use this command to run Storybook
npm run storybook