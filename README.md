# NewsGPT

Hello 👋🏻 You can use NewsGPT to get the latest news about anything–any topic, category, entity or event. See it in action: [http://news-gpt.io](http://news-gpt.io)

NewsGPT is powered by GPT-3 and AYLIEN News API. The source code of NewsGPT can be accessed here. NewsGPT is developed using ChatGPT.

![NewsGPT demo](https://media.giphy.com/media/az9ZeMw5vhBrL5G2XK/giphy.gif)

The project consists of a Flask backend (in the `api` folder) and a React frontend (in the `client` folder).

To run NewsGPT locally:

**1. Start the backend**

Create a `config.yml` file which contains your OpenAI and News API credentials (see `config.yml.example` for a template).

```
cd api/
pip install -r requirements.txt
python3 -m flask run --host=0.0.0.0 --port=5001
```

Note: If you run the API on a different port you will need to update `api_url` in `src/App.js`.

**2. Start the frontend**

```
cd client/
npm install
npm start build
```

(Use `.env` for configuring the local development server)

You should now have NewsGPT running on your local machine (by default on port 80). Open http://HOSTADDRESS/ in your browser to access the app.

## Server configuration

Follow the next steps to run NewsGPT on a production web server. Ensure you have Nginx up and running on your server.

Config based on the following articles:
- [https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uswgi-and-nginx-on-ubuntu-18-04](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uswgi-and-nginx-on-ubuntu-18-04)
- [https://www.digitalocean.com/community/tutorials/how-to-deploy-a-react-application-with-nginx-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-react-application-with-nginx-on-ubuntu-20-04)

**1. Configure Nginx**

Assuming Ubuntu. Copy and configure the Nginx config file `news-gpt.io.conf` to `/etc/nginx/conf.d/`. Don't forget to restart Nginx afterwards to load the new config.

Follow [this guide](https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/) to obtain a Let's Encrypt SSL cert and add it to Nginx server (the configuration is already there, you just need to point it to the right cert and key files).

Ensure your firewall is set to allow HTTP and HTTPS traffic to the server.

**2. Build the React app and copy to Nginx folder**

Before you build the app you need to make sure the value of `api_url` in `src/App.js` points to your local production API server e.g. `https://${window.location.hostname}/api`.

```
cd client/
npm run build
cp -R build/ /var/www/
```

If you open your server's address in a browser now you should see the frontend of NewsGPT.

**3. Configure uwsgi to serve the Flask API**

Copy the uwsgi service description from `wsgi.service` to `/etc/systemd/system`. Start the service using `sudo systemctl start wsgi`. Make sure `wsgi.ini` is configured properly.
