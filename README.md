# Assistant Backend

The Assistant Backend is a project deployed to [Firebase](https://firebase.google.com/) via [Functions](https://firebase.google.com/docs/functions) to handle the backend of the Google Assistant (And possibly other assistants in the future) for [MS Paint IDE](https://github.com/MSPaintIDE/MSPaintIDE). The assistant support allows for the following things currently:

- Link accounts to MS Paint IDE securely
- Stop, Highlight, Compile, and Run your code from your voice with ~500ms delay
- Say bye to you

All the database changes are listened to by the client, via the library [PaintAssistant](https://github.com/MSPaintIDE/PaintAssistant). The backend is not done, with more features planned. If you have any suggestions, just make a PR. The agent.zip is planned to be published shortly.

