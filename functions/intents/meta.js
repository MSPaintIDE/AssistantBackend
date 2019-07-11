const {convert} = require('../utils');
const signin = require('./signin');

const {BasicCard, Button, Image, Suggestions, LinkOutSuggestion} = require('actions-on-google');

function registerMeta(app) {
    app.intent(['actions.intent.MAIN', 'Default Welcome Intent'], conv => {
        conv.user.storage.confirmText = null;
        conv.ask(convert`Welcome to MS Paint IDE, if you need help, just ask. <break time="1s"/>Can I do anything for you?`);
    });

    app.intent('Default Fallback Intent', (conv) => {
        unknownIntent(conv);
    });

    app.intent('thanks', (conv) => {
        conv.ask(random(
            `No problem, can I do anything else for you?`,
            `Any time, do you need any more help?`
        ));
    });

    app.intent('exit', (conv) => {
        conv.close(random(
            `Bye, I'll see you soon!`,
            `See you soon!`
        ));
    });

    app.intent('default_no_input', (conv) => {
        const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
        if (repromptCount === 0) {
            conv.ask(`What was that?`);
        } else if (repromptCount === 1) {
            conv.ask(`Sorry I didn't catch that. Could you repeat yourself?`);
        } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
            conv.close(`Alright, I'll talk to you later. See you soon!`);
        }
    });

    app.intent('help', (conv) => {
        let signedIn = signin.isSignedIn(conv);

        conv.ask(new Suggestions(signedIn ? ['Run my code'] : ['Log me in']));
        conv.ask(new LinkOutSuggestion({
            name: 'Discord',
            url: 'https://discord.gg/RXmPkPJ',
        }));

        let signupPrecursor = signedIn ? `To start linking the assistant to your IDE, just say 'Sign me up' to connect your accounts.` : ``;

        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            if (!signedIn) {
                conv.ask(`To get started with assistant integration, just ask to sign in.`);
            }

            conv.ask(convert`Once you sign into the desktop IDE, you can ask to stop, compile, highlight, and run your code.`);
            conv.ask(convert`For more info, check out our website by Googleing MS Paint IDE`);
            return;
        }

        conv.ask('Check out the card on your screen to see what I can do.');
        conv.ask(new BasicCard({
            text: `${signupPrecursor}
                    Once you sign into the desktop IDE, you can ask to stop, compile, highlight, and run your code.
                    For more info, check out our website by Googleing MS Paint IDE`,
            subtitle: 'Using The IDE & Assistant',
            title: 'Assistant Help',
            buttons: new Button({
                title: 'Website',
                url: 'https://ms-paint-i.de/',
            }),
            image: new Image({
                url: 'https://ms-paint-i.de/images/actions-image.png',
                alt: 'MS Paint IDE',
            }),
            display: 'CROPPED',
        }));
    });
}

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

module.exports = {registerMeta, unknownIntent, random};
