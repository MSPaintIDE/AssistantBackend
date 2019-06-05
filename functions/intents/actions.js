const signin = require('./signin');
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

        conv.ask(`Sure, I'll run your program, ${conv.user.profile.payload.given_name}`);

        let userRef = db.ref(`/users/${conv.user.profile.payload.sub}`);

        action.forEach(curr => {
            userRef.child(curr).set({active: Date.now()}).then(() => {
                console.log('Done!');
            }).catch(err => {
                console.log('Error!');
                console.log(err);
            })
        })
    });

    app.intent('get_confirmation', (conv, input, confirmation) => {
        console.log(`conv.user.storage.confirmText = ${JSON.stringify(conv.user.storage.confirmText)}`);
        console.log(`confirmation = ${JSON.stringify(confirmation)}`);
        // console.log(`input = ${input.text}`);
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
                metaIntent.unknownIntent(conv);
                break;
        }
    });
}

module.exports = {registerActions};
