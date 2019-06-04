const functions = require('firebase-functions');
const admin = require('firebase-admin');

const {convert} = require('./utils');
const {dialogflow, SignIn, Confirmation} = require('actions-on-google');
const app = dialogflow({
    clientId: '1007043913400-c1e9fqi3nva3i4rehfeppogah1659emj.apps.googleusercontent.com',
});

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://ms-paint-ide.firebaseio.com'
});

const db = admin.database();

const actionExecutionOrder = {'stop': 0, 'highlight': 1, 'compile': 2, 'run': 3};

const notSignedIn = `I can't perform that action since you're not signed in. Would you like to sign in for full functionality?`;

// Intent that starts the account linking flow.
app.intent(['actions.intent.MAIN', 'Default Welcome Intent'], conv => {
    // console.log(JSON.stringify(conv));
    conv.user.storage.confirmText = null;
    conv.ask(convert`Welcome to MS Paint IDE`);
});

// Intent that starts the account linking flow.
app.intent('perform_action', (conv, {action}) => {
    if (!isSignedIn(conv)) {
        signInPrompt(conv);
        return;
    }

    console.log('Action:');
    console.log(`Unsorted: ${action}`);

    // let map = new Map();
    // actions.forEach(action => map.set(action, actionExecutionOrder[action]));
    action.sort((a, b) => actionExecutionOrder[a] - actionExecutionOrder[b]);

    console.log(`Sorted: ${action}`);

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
            unknownIntent(conv);
            break;
    }
});


///// Sign in intents
{

    // Intent that starts the account linking flow.
    app.intent('start_signin', (conv) => {
        conv.ask(new SignIn('To get your account details'));
    });

    // Create a Dialogflow intent with the `actions_intent_SIGN_IN` event.
    app.intent('get_signin', (conv, params, signin) => {
        if (signin.status === 'OK') {
            const payload = conv.user.profile.payload;
            console.log(`Payload = ${payload}`);
            conv.ask(`I got your account details, ${payload.given_name}. What do you want to do next?`);
        } else {
            conv.ask(`I won't be able to save your data, but what do you want to do next?`);
        }
    });

    function signInPrompt(conv) {
        conv.ask(new Confirmation(notSignedIn));
        conv.user.storage.confirmText = notSignedIn;
    }
}

/////////

app.intent('Default Fallback Intent', (conv) => {
    unknownIntent(conv);
});

app.intent('exit', (conv) => {
    conv.close(random(
        `Bye, I'll see you soon!`,
        `See you soon!`
    ));
});

function unknownIntent(conv) {
    conv.ask(random(
        `I didn't get that, can you try again?`,
        `I didn't catch that, can you try again?`,
        `I'm not sure what you said, can you try that again?`,
        `I don't understand that, can you try again?`
    ));
}

function random(...messages) {
    return messages[Math.floor(Math.random() * messages.length)]
}


function isSignedIn(conv) {
    return conv.user.profile.payload !== undefined;
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);