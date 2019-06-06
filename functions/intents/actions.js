const signin = require('./signin');
const {random, unknownIntent} = require('./meta');
const notSignedIn = require('../constants').notSignedIn;
const {SignIn} = require('actions-on-google');

const {db} = require('../db');

const actionExecutionOrder = {'stop': 0, 'highlight': 1, 'compile': 2, 'run': 3};

function registerActions(app) {
    app.intent('perform_action', (conv, {action}) => {
        if (!signin.isSignedIn(conv)) {
            signin.signInPrompt(conv, notSignedIn);
            return;
        }

        action.sort((a, b) => actionExecutionOrder[a] - actionExecutionOrder[b]);

        let name = conv.user.profile.payload.given_name;
        let nameAppend = !(+new Date()%2) >= 0.5 ? `, ${name}` : ``;
        conv.ask(random(
            `Sure thing${nameAppend}!`,
            `You got it${nameAppend}!`,
            `I'm on it${nameAppend}!`
        ));

        let userRef = db.ref(`/users/${conv.user.profile.payload.sub}`);

        userRef.child("actions").remove(() => userRef.set({
            "actions": action,
            "timestamp": Date.now()
        }).then(() => {
            console.log('Done!');
        }).catch(err => {
            console.log('Error during action setting!');
            console.log(err);
        })).catch(err => {
            console.log('Error during initial remove!');
            console.log(err);
        });
    });

    app.intent('get_confirmation', (conv, input, confirmation) => {
        switch (conv.user.storage.confirmText) {
            case notSignedIn:
                if (confirmation) {
                    conv.close(`Alright, sounds good!`);
                    conv.ask(new SignIn('To get your account details'));
                } else {
                    conv.ask(`That's fine, feel free to ask for help if you're wondering what else you can do.`);
                }
                break;
            default:
                unknownIntent(conv);
                break;
        }
    });
}

module.exports = {registerActions};
