# EasyMina Frontend Experiment

Welcome to an experimental bare-bone server designed for creating zero-knowledge proofs in a web browser. Prior to proceeding, please ensure that `snarkyjs` is compressed during the build process.

## Step 0: Install Dependencies

```bash
npm install
# npm install express nodemon
# npm install webpack webpack-cli --save-dev
```

## Step 1: Generate a Build for `snarkyjs`

Install webpack:

```bash
npx webpack --config webpack.config.js
```

## Step 2: Launch the Server

Execute the following command to run the server:

```bash
npm run instantRefresh
# node frontend.mjs
```

## Step 3: Web Browser

Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

Features available:

- Load Module
- Import Module
- Compile

Console output:

```
zkApp
```

Feel free to explore and experiment with the provided functionalities.