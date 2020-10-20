const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const movies = require('./movie-store.json');

app.use(helmet());
app.use(cors());
app.use(morgan('common'));

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
    responseMovies = responseMovies.filter(movie => {
      return movie.genre.includes(genre);
    })
  }

  if(country) {
    responseMovies = responseMovies.filter( movie => {
      return movie.country.includes(country);
    })
  }

  if(avg_vote) {
    const avg_vote_num = parseFloat(avg_vote);
    responseMovies = responseMovies.filter( movie => {
      return movie.avg_vote >= avg_vote_num;
    })
  }
  
  res.send(responseMovies);
};

app.get('/movie', handleGetMovies)

app.listen(8000, () => {
  console.log('server is up on 8000');
  console.log(process.env.API_TOKEN)
})