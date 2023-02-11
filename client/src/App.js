import './App.css';

import React, { useState } from "react";
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Slider from '@mui/material/Slider';

import TimeAgo from 'react-timeago';

function App() {
  const [aql_inputText, setaql_inputText] = useState("");
  const [aql_apiResponse, setaql_apiResponse] = useState("");
  const [aql_loading, setaql_loading] = useState(false);

  const [news_inputTextAQL, setnews_inputTextAQL] = useState("");
  const [news_inputTextParams, setnews_inputTextParams] = useState("");
  const [news_inputNumArticles, setnews_inputNumArticles] = useState(10);
  const [news_apiResponse, setnews_apiResponse] = useState("");
  const [news_loading, setnews_loading] = useState(false);

  const [summary_apiResponse, setsummary_apiResponse] = useState("");
  const [summary_inputNumSentences, setsummary_inputNumSentences] = useState(3);
  const [summary_loading, setsummary_loading] = useState(false);

  const api_url = `http://${window.location.hostname}:5001`;

  const aql_handleSubmit = async (event) => {
    event.preventDefault();
    setaql_loading(true);

    try {
      const response = await fetch(`${api_url}/text2aql?text=${aql_inputText}`);
      const data = await response.json();
      setaql_apiResponse(data.aql);
    } catch (error) {
      setaql_apiResponse({ error: "There was a problem with the API call." });
    } finally {
      setaql_loading(false);
    }
  };

  const aql_handleClick = async (event) => {
    event.preventDefault();
    var parts = aql_apiResponse.split("\n");
    setnews_inputTextAQL(parts[1]);
    setnews_inputTextParams(parts[2]);
  };

  const news_handleSubmit = async (event) => {
    event.preventDefault();
    setnews_loading(true);

    try {
      const response = await fetch(`${api_url}/fetchnews?aql=${news_inputTextAQL}&params=${news_inputTextParams}&num_articles=${news_inputNumArticles}`);
      const data = await response.json();
      setnews_apiResponse(data.stories);
    } catch (error) {
      setnews_apiResponse({ error: "There was a problem with the API call." });
    } finally {
      setnews_loading(false);
    }
  };

  const summary_handleSubmit = async (event) => {
    event.preventDefault();
    setsummary_loading(true);
    
    const headlines = news_apiResponse.map(({ title }) => (title)).join("\\n")
    
    try {
      const response = await fetch(`${api_url}/summarize?headlines=${headlines}&num_sentences=${summary_inputNumSentences}`);
      const data = await response.json();
      setsummary_apiResponse(data.summary);
    } catch (error) {
      setsummary_apiResponse({ error: "There was a problem with the API call." });
    } finally {
      setsummary_loading(false);
    }
  };

  const example_handleClick = async (event) => {
    event.preventDefault();
    setaql_inputText(event.target.innerText);
  };

  const numarticles_handleSliderChange = async (event) => {
    setnews_inputNumArticles(event.target.value);
  };

  const numsentences_handleSliderChange = async (event) => {
    setsummary_inputNumSentences(event.target.value);
  };

  return (
    <Container fixed justifyContent="center" alignItems="center" maxWidth="md" style={{'margin-top': '50px'}}>
      <h1>NewsGPT</h1>
      <div>Hello 👋🏻 You can use NewsGPT to get the latest news about anything–any topic, category, entity or event. <br/><br/>NewsGPT is powered by GPT-3 and <Link href="https://aylien.com" target="_blank">AYLIEN News API</Link>. The source code of NewsGPT can be accessed here. NewsGPT is developed using ChatGPT.<br/><br/><br/></div>
      <p><b>Step 1. Generate an AQL using GPT-3</b></p>
      <Box>
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center'}}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Enter your query in plain English, and press the arrow"
              value={aql_inputText}
              onChange={(event) => setaql_inputText(event.target.value)}
            />
            <IconButton color="primary" sx={{ p: '10px' }} onClick={aql_handleSubmit} disabled={aql_inputText.length !== 0 ? false : true}>
              <SendIcon />
            </IconButton>
          </Paper>
      </Box>
      <Box>
        <br/><br/>
        Examples:
        <ul>
          <li><Link href="#" onClick={example_handleClick}>Show me articles that have Elon Musk in their title, but not SpaceX</Link></li>
          <li><Link href="#" onClick={example_handleClick}>What happened in biotech 3 months ago in Germany?</Link></li>
          <li><Link href="#" onClick={example_handleClick}>What are the latest car crashes?</Link></li>
          <li><Link href="#" onClick={example_handleClick}>What's in the news about the president of China that has a negative sentiment?</Link></li>
        </ul>
      </Box>
      <Box>
        {aql_loading && <div><CircularProgress /></div>}
        {!aql_loading && aql_apiResponse !== "" && <div><h4>AQL:</h4><Card sx={{ maxWidth: 345 }}><CardActionArea onClick={aql_handleClick}><CardContent><Typography variant="body2" color="text.secondary">{aql_apiResponse}</Typography></CardContent></CardActionArea></Card></div>}
      </Box>
      <p><br/><br/><b>Step 2. Fetch news articles using News API</b></p>
      <Box>
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center'}}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Enter your News API AQL"
              value={news_inputTextAQL}
              onChange={(event) => setnews_inputTextAQL(event.target.value)}
            />
            <IconButton color="primary" sx={{ p: '10px' }} onClick={news_handleSubmit} disabled={news_inputTextAQL.length !== 0 ? false : true}>
              <SendIcon />
            </IconButton>
          </Paper>
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center'}}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Enter your News API params"
              value={news_inputTextParams}
              onChange={(event) => setnews_inputTextParams(event.target.value)}
            />
          </Paper>
          <br/>
          <Typography id="input-slider" gutterBottom>
            Number of articles to fetch (automatically added to News API params)
          </Typography>
          <Slider
            aria-label="Number of articles"
            defaultValue={10}
            onChange={numarticles_handleSliderChange}
            valueLabelDisplay="auto"
            step={10}
            min={10}
            max={100}
          />
      </Box>
      <Box>
        {news_loading && <div><CircularProgress /></div>}
        {!news_loading && news_apiResponse.length !== 0 && 
          news_apiResponse.map(({ id, title, links, source, published_at }) => (
            <p key={id}><Link href={links.permalink} target="_blank"> {title}</Link> - {source.name} (<TimeAgo date={published_at} />)</p>
          ))
        }
      </Box>
      <p><br/><br/><b>Step 3. Summarize the headlines using GPT-3</b></p>
      <Box>
        <br/>
          <Typography id="input-slider" gutterBottom>
            Number of sentences in summary
          </Typography>
          <Slider
            aria-label="Number of articles"
            defaultValue={3}
            onChange={numsentences_handleSliderChange}
            valueLabelDisplay="auto"
            step={1}
            min={1}
            max={10}
          />
          <Button variant="contained" onClick={summary_handleSubmit} disabled={news_apiResponse.length !== 0 ? false : true}>Summarize</Button>
      </Box>
      <Box style={{'margin-top': '40px'}}>
        {summary_loading && <div><CircularProgress /></div>}
        {!summary_loading && summary_apiResponse !== "" && <div><h4>Summary:</h4><div>{summary_apiResponse}</div></div>}
      </Box>
      <Box style={{'margin-top': '100px', 'margin-bottom': '50px'}}>
        powered by<br/><br/>
        <a href="https://aylien.com/" target="_blank">
          <img src="https://aylien.com/img/logos/aylien-logo.svg" alt="Aylien Logo" style={{'width': '120px'}}/>
        </a>
        <br/>
        <a href="https://openai.com/" target="_blank">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1600px-OpenAI_Logo.svg.png" alt="OpenAI Logo" style={{'width': '120px', 'margin-top': '4px'}}/>
        </a>
      </Box>
    </Container>
  );
}

export default App;
