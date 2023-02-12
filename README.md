# NewsGPT

Hello 👋🏻 You can use NewsGPT to get the latest news about anything–any topic, category, entity or event.

NewsGPT is powered by GPT-3 and AYLIEN News API. The source code of NewsGPT can be accessed here. NewsGPT is developed using ChatGPT.

![NewsGPT demo](https://media.giphy.com/media/az9ZeMw5vhBrL5G2XK/giphy.gif)

The project consists of a Flask backend (in the `api` folder) and a React frontend (in the `client` folder).

To run NewsGPT:

**1. Start the backend**

Create a `config.yml` file which contains your OpenAI and News API credentials (see `config.yml.example` for a template).

```
cd api/
pip install -r requirements.txt
python3 -m flask run --host=0.0.0.0 --port=5001
```

**2. Start the frontend**

```
cd client/
npm install
npm start build
```

You should now have NewsGPT running on your local machine (by default on port 80). Open http://HOSTADDRESS/ in your browser to access the app.
