# Motorcycle Workshop Management Application

This template should help get you started developing with Vue 3 in Vite (Web based app).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

This project runs on Vue 3, Composition Style with Vue-Router, Pinia, and Firebase. 

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Publish to Google's firebase

Since google has a great free option to try.

First need the tools to work with firebase.

```sh
npm i firebase-tools
```

### Sign into firebase console to configure project (Authentication, Firestore, Hosting, Storage, and Cloud Functions). 

Once you setup and configure firebase, return and load needed API keys into project.

###Firebase init
```sh
firebase init
```
###Configure firebase project to communicate

This should be the same settings as from google console project settings.

Default is public directory, so change hosting to dist folder.

###This will deploy only the hosting otherwise everything
```sh
firebase deploy --only hosting
```


### NOTE: THIS IS A HEADER FIELD IN README.md file
You can copy or change this for specific font/displays, including 3 "`" marks with "sh" then the node commands in shell which ends with another 3 "`" marks to end.

```sh
npm i firebase-tools
```
