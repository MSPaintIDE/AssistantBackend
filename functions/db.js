const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://ms-paint-ide.firebaseio.com'
});

exports.db = admin.database();
