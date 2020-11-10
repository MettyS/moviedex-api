const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const movies = require('./movie-store.json');

app.use(helmet());
app.use(cors());
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

const validateBearerToken = function (req, res, next) {
  const token= process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if(!authToken || authToken.split(" ")[1] !== token) {
    return res.status(401).json({ error: "Unauthorized request" })
  }
  next();
};

app.use(validateBearerToken);


const handleGetMovies = function (req, res) {
  const { genre='', country='', avg_vote=0 } = req.query;
  let responseMovies = movies;

  if(genre) {
    responseMovies = responseMovies.filter(movie => 
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if(country) {
    responseMovies = responseMovies.filter( movie => 
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if(avg_vote) {
    const avg_vote_num = parseFloat(avg_vote);
    responseMovies = responseMovies.filter( movie => 
      movie.avg_vote >= avg_vote_num
    );
  }
  
  res.send(responseMovies);
};

app.get('/movie', handleGetMovies)

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`running on ${PORT}`);
})