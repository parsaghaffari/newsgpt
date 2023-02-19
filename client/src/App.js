import './App.css';

import React, { useState, useEffect, useRef } from "react";
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import StopCircleIcon from '@mui/icons-material/StopCircle';

import TimeAgo from 'react-timeago';
import ReactGA from "react-ga4";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function App() {
  const [aql_inputText, setaql_inputText] = useState("");
  const [aql_loading, setaql_loading] = useState(false);
  const aql_submit_button= useRef(null);

  const [news_inputTextAQL, setnews_inputTextAQL] = useState("");
  const [news_inputTextParams, setnews_inputTextParams] = useState("");
  const [news_inputNumArticles, setnews_inputNumArticles] = useState(10);
  const [news_apiResponse, setnews_apiResponse] = useState("");
  const [news_loading, setnews_loading] = useState(false);
  const news_submit_button= useRef(null);

  const [summary_apiResponse, setsummary_apiResponse] = useState("");
  const [summary_inputNumSentences, setsummary_inputNumSentences] = useState(3);
  const [summary_loading, setsummary_loading] = useState(false);

  const [params_hidden, set_params_hidden] = useState(true);
  const [aql_received, set_aql_received] = useState(false);
  
  const [speech_playing, set_speech_playing] = useState(false);

  const api_url = `http://${window.location.hostname}:5001/api`;

  const TRACKING_ID = "G-L8PWKQ7CY7";
  ReactGA.initialize(TRACKING_ID);
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });

  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript !== '') {
     setaql_inputText(transcript);
    }
    if (finalTranscript !== '') {
      aql_submit_button.current.click();
    }
  }, [transcript, finalTranscript]);

  useEffect(() => {
    if(aql_received && params_hidden) {
      news_submit_button.current.click();
      set_aql_received(false);
    }
  }, [params_hidden, aql_received, news_submit_button]);

  const aql_handleSubmit = async (event) => {
    event.preventDefault();
    setaql_loading(true);

    try {
      const response = await fetch(`${api_url}/text2aql?text=${aql_inputText}`);
      const data = await response.json();
      var parts = data.aql.split("\n");
      setnews_inputTextAQL(parts[1]);
      setnews_inputTextParams(parts[2]);
      set_aql_received(true);
    } catch (error) {
      setnews_inputTextAQL("There was a problem with the API call.");
      setnews_inputTextParams("There was a problem with the API call.");
    } finally {
      setaql_loading(false);
    }
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

  const params_collapse_handleClick = () => {
    set_params_hidden(!params_hidden);
  };

  const speak_play = (event) => {
    event.preventDefault();

    set_speech_playing(true);
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(summary_apiResponse);
    utterance.voice = synth.getVoices()["Alex"];

    synth.speak(utterance);
  };

  const speak_stop = (event) => {
    event.preventDefault();

    set_speech_playing(false);
    const synth = window.speechSynthesis;
    synth.pause();
    synth.cancel();
  };

  return (
    <Container fixed justifyContent="center" alignItems="center" maxWidth="md" style={{'margin-top': '50px'}}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <h1>NewsGPT</h1>
        </Grid>
        <Grid item xs={6}>
          <h1 style={{'text-align': 'right'}}><a class="github-button" href="https://github.com/parsaghaffari/newsgpt" data-color-scheme="no-preference: dark; light: dark; dark: dark;" data-size="large" data-show-count="true" aria-label="Star parsaghaffari/newsgpt on GitHub">Star</a></h1>
        </Grid>
    </Grid>
      <p>Hello 👋🏻 You can use NewsGPT to get the latest news about anything–any topic, category, entity or event.</p>
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
            <IconButton color={!listening ? "primary" : "error"} sx={{ p: '10px' }} onClick={listening ? SpeechRecognition.stopListening : SpeechRecognition.startListening}>
              <MicIcon />
            </IconButton>
            <IconButton color="primary" sx={{ p: '10px' }} ref={aql_submit_button} onClick={aql_handleSubmit} disabled={aql_inputText.length !== 0 && !aql_loading ? false : true}>
              <SendIcon />
            </IconButton>
          </Paper>
      </Box>
      <Box>
        <p>
          <b>Examples</b>
          <ul>
            <li><Link href="#" onClick={example_handleClick}>Show me articles that have Elon Musk in their title, but not SpaceX</Link></li>
            <li><Link href="#" onClick={example_handleClick}>What happened in biotech 3 months ago in Germany?</Link></li>
            <li><Link href="#" onClick={example_handleClick}>What are the latest car crashes?</Link></li>
            <li><Link href="#" onClick={example_handleClick}>What's in the news about the president of China that has a negative sentiment?</Link></li>
          </ul>
        </p>
      </Box>
      <Accordion expanded={!params_hidden} onChange={params_collapse_handleClick}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="button">Show parameters</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <p><b>Underlying News API query</b></p>
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
            <IconButton color="primary" sx={{ p: '10px' }} ref={news_submit_button} onClick={news_handleSubmit} disabled={news_inputTextAQL.length && !news_loading ? false : true}>
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
        </AccordionDetails>
      </Accordion>
      <br/>
      <Box>
        {(aql_loading || news_loading) && <div><LinearProgress /></div>}
      </Box>
      <Box>
        {!news_loading && news_apiResponse.length !== 0 && <b>Headlines</b>}
        <ul>
        {!news_loading && news_apiResponse.length !== 0 &&
          news_apiResponse.map(({ id, title, links, source, published_at }) => (
            <li><p key={id}><Link href={links.permalink} target="_blank"> {title}</Link> - {source.name} (<TimeAgo date={published_at} />)</p></li>
          ))
        }
        </ul>
      </Box>
      {
        news_apiResponse.length !== 0
        ? <Box>
            <p><br/><br/><b>Summarize the headlines</b></p>
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
              <Button variant="contained" onClick={summary_handleSubmit}>Summarize</Button>
          </Box>
        : <p></p>
      }
      <Box style={{'margin-top': '40px'}}>
        {summary_loading && <div><LinearProgress /></div>}
        {!summary_loading && summary_apiResponse !== "" 
          && <div>
              <h4>Summary:</h4>
              <div>{summary_apiResponse}</div>
              {
              speech_playing 
                ? <IconButton size="large" color="primary" onClick={speak_stop}><StopCircleIcon fontSize="inherit" /></IconButton>
                : <IconButton size="large" color="primary" onClick={speak_play}><RecordVoiceOverIcon fontSize="inherit" /></IconButton>
              }
            </div>
        }
      </Box>
      <Box style={{'margin-top': '250px', 'margin-bottom': '50px'}}>
        <hr></hr>
        <Typography variant="subtitle2">NewsGPT is powered by GPT-3 and <Link href="https://aylien.com" target="_blank">AYLIEN News API</Link>. The source code of NewsGPT can be accessed <Link href="https://github.com/parsaghaffari/newsgpt" target="_blank">here</Link>. NewsGPT is mostly developed using ChatGPT.<br/><br/><br/></Typography>
        <Typography variant="subtitle2">powered by</Typography><br/>
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
