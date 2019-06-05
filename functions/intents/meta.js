const {convert} = require('../utils');
const signin = require('./signin');

const {BasicCard, Button, Image, Suggestions, LinkOutSuggestion} = require('actions-on-google');

function registerMeta(app) {
    app.intent(['actions.intent.MAIN', 'Default Welcome Intent'], conv => {
        conv.user.storage.confirmText = null;
        conv.ask(convert`Welcome to MS Paint IDE`);
    });

    app.intent('Default Fallback Intent', (conv) => {
        unknownIntent(conv);
    });

    app.intent('exit', (conv) => {
        conv.close(random(
            `Bye, I'll see you soon!`,
            `See you soon!`
        ));
    });

    app.intent('help', (conv) => {
        let signedIn = signin.isSignedIn(conv);

        conv.ask(new Suggestions(signedIn ? ['Run my code'] : ['Sign me up']));
        conv.ask(new LinkOutSuggestion({
            name: 'Discord',
            url: 'https://discord.gg/RXmPkPJ',
        }));

        let signupPrecursor = signedIn ? `To link the assistant and your IDE, just say 'Sign me up' to connect your accounts.` : ``;

        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
            if (!signedIn) {
                conv.ask(`To get started with assistant integration, just ask to sign in.`);
            }

            if (!signedIn) conv.ask(signupPrecursor);
            conv.ask(convert`Once you sign into the IDE as well, you can ask to stop, compile, highlight, and run your code.`);
            conv.ask(`For more info, check out our website, or join our official Discord server.`);
            return;
        }

        conv.ask('Check out the card on your screen to see what I can do.');
        conv.ask(new BasicCard({
            text: `${signupPrecursor}
                    Once you sign into the IDE as well, you can ask to stop, compile, highlight, and run your code.
                    For more info, check out our website, or join our official Discord server. If you're interested
                    in the development of the IDE, check out the GitHub organization linked in our website.`,
            subtitle: 'Using The IDE & Assistant',
            title: 'Assistant Help',
            buttons: new Button({
                    title: 'Website',
                    url: 'https://ms-paint-i.de/',
                }),
            image: new Image({
                url: 'https://ms-paint-i.de/images/actions-image.png',
                alt: 'Image alternate text',
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
