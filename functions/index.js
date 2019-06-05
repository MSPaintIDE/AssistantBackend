const functions = require('firebase-functions');

const {dialogflow} = require('actions-on-google');
const app = dialogflow({
    clientId: '1007043913400-c1e9fqi3nva3i4rehfeppogah1659emj.apps.googleusercontent.com',
});

const signin = require('./intents/signin');
const meta = require('./intents/meta');
const actions = require('./intents/actions');

signin.registerSignin(app);
meta.registerMeta(app);
actions.registerActions(app, this);

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
exports.signin = signin;
exports.meta = meta;
exports.actions = actions;
