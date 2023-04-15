# document-summariser

Document Summariser is an interactive tool that generates summaries from text using GPT.

![example](screenshot.png)

_Note: this app was put together as a proof of concept. As a result, some shortcuts were taken during development._

## Instructions

There is a client and a server.

### Server

The server is built with Python@^3.9, FastAPI, and some helper packages for things like typing/validation, reading from .env, and OpenAI interaction and NLP. It is built using [Poetry](https://python-poetry.org/), so make sure this is installed along with Python@^3.9.

To run the server, first add your OpenAI API key to a `.env` file with `echo <your-api-key> > server/.env`. Then install dependencies using `poetry install`. Finally, run the server with `poetry run python main.py`.

### Client

The client is built with React + TypeScript, and was bootstrapped with `create-react-app`. To run it, install dependencies with `cd client && npm install`. Then run it with `npm start`. It'll run on `localhost:3000`, so navigate to this address in your browser.

## Built with

- [React](https://react.dev/) - Client UI library
- [TypeScript](https://www.typescriptlang.org/) - Typing for JavaScript
- [OpenAI](https://openai.com/) - Completion and embeddings API
- [Poetry](https://python-poetry.org/) - Python dependency management
- [FastAPI](https://fastapi.tiangolo.com/) - Server framework

## License

[MIT license](./LICENSE)
