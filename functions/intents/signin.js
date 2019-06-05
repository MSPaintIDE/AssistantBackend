const {SignIn, Confirmation} = require('actions-on-google');

function registerSignin(app) {
    app.intent('start_signin', (conv) => {
        conv.ask(new SignIn('To get your account details'));
    });

    app.intent('get_signin', (conv, params, signin) => {
        if (signin.status === 'OK') {
            const payload = conv.user.profile.payload;
            conv.ask(`I got your account details, ${payload.given_name}. What do you want to do next?`);
        } else {
            conv.ask(`I won't be able to save your data, but what do you want to do next?`);
        }
    });
}

function signInPrompt(conv, notSignedIn) {
    conv.ask(new Confirmation(notSignedIn));
    conv.user.storage.confirmText = notSignedIn;
}

function isSignedIn(conv) {
    return conv.user.profile.payload !== undefined;
}

module.exports = {registerSignin, signInPrompt, isSignedIn};
