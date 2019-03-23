# Installation
After forking and cloning the project (see README.md in the parent directory), you can install the libraries by using the following command:
```sh
❯ npm install
```
After that, you need to go in the config directory for creating a file which contains the mongoDB credentials (follow README.md in the config directory).

# REST API
After changing directory to the current one, you can launch the server with:
```sh
❯ node server.js
```
## Endpoints of the API

### `GET /movies/populate`
Populate the database with all the Denzel's movies from IMDB
```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies/populate
{
  "ok":1,
  "n":56,
  "opTime":{
    "ts":"6671621211979513913",
    "t":2
   }
}
```
### `GET /movies`
Fetch a random **must-watch** movie (metascore higher than 70)
```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies
{
  "id": "tt0765429",
  "link": "https://www.imdb.com/title/tt0765429/?ref_=nm_flmg_act_13",
  "metascore": 76,
  "poster": "https://m.media-amazon.com/images/M/MV5BMTkyNzY5MDA5MV5BMl5BanBnXkFtZTcwMjg4MzI3MQ@@._V1_UY268_CR4,0,182,268_AL_.jpg",
  "rating": 7.8,
  "synopsis": "An outcast New York City cop is charged with bringing down Harlem drug lord Frank Lucas, whose real life inspired this partly biographical film.",
  "title": "American Gangster (2007)",
  "votes": 362.951,
  "year": 2007
}
```
### `GET /movies/:id`
Fetch a specific movie
```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies/tt0477080
{
  "id": "tt0477080",
  "link": "https://www.imdb.com/title/tt0477080/?ref_=nm_flmg_act_9",
  "metascore": 69,
  "poster": "https://m.media-amazon.com/images/M/MV5BMjI4NDQwMDM0N15BMl5BanBnXkFtZTcwMzY1ODMwNA@@._V1_UX182_CR0,0,182,268_AL_.jpg",
  "rating": 6.8,
  "synopsis": "With an unmanned, half-mile-long freight train barreling toward a city, a veteran engineer and a young conductor race against the clock to prevent a catastrophe.",
  "title": "Unstoppable (2010)",
  "votes": 171.245,
  "year": 2010
  }
```
### `GET /movies/search`
Search for Denzel's movies
This endpoint accepts the following optional query string parameters:

* `limit` - number of movies to return (default: 5)
* `metascore` - filter by metascore (default: 0)

The results array should be sorted by metascore in descending way.

```sh
❯ curl -H "Accept: application/json" http://localhost:9292/movies/search?limit=5&metascore=77
 [
 {
    "id": "tt2671706",
    "link": "https://www.imdb.com/title/tt2671706/?ref_=nm_flmg_act_3",
    "metascore": 79,
    "poster": "https://m.media-amazon.com/images/M/MV5BOTg0Nzc1NjA0MV5BMl5BanBnXkFtZTgwNTcyNDQ0MDI@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 7.2,
    "synopsis": "A working-class African-American father tries to raise his family in the 1950s, while coming to terms with the events of his life.",
    "title": "Fences (2016)",
    "votes": 84.291,
    "year": 2016
  },
  {
    "id": "tt0115956",
    "link": "https://www.imdb.com/title/tt0115956/?ref_=nm_flmg_act_31",
    "metascore": 77,
    "poster": "https://m.media-amazon.com/images/M/MV5BODJlOTlkNzUtN2U2OC00NWUxLTg3MjgtNGVmZGU5ZTk0ZjM4XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 6.6,
    "synopsis": "A U.S. Army officer, despondent about a deadly mistake he made, investigates a female chopper commander's worthiness for the Medal of Honor.",
    "title": "À l'épreuve du feu (1996)",
    "votes": 46.271,
    "year": 1996
  },
  {
    "id": "tt0112857",
    "link": "https://www.imdb.com/title/tt0112857/?ref_=nm_flmg_act_32",
    "metascore": 78,
    "poster": "https://m.media-amazon.com/images/M/MV5BNjI3NjFiNmMtMmQ1ZC00OTUwLWJlMWMtM2UxY2M2NDQ0OWJhXkEyXkFqcGdeQXVyNTI4MjkwNjA@._V1_UX182_CR0,0,182,268_AL_.jpg",
    "rating": 6.7,
    "synopsis": "An African-American man is hired to find a woman, and gets mixed up in a murderous political scandal.",
    "title": "Le diable en robe bleue (1995)",
    "votes": 15.686,
    "year": 1995
  }
  ]
```
### `POST /movies/:id`

Save a watched date and a review

This endpoint accepts the following post parameters:

* `date` - the watched date
* `review` - the personal review

```sh
❯ curl -X POST -d '{"date": "2019-03-04", "review": "😍 🔥"}' -H "Content-Type: application/json" http://localhost:9292/movies/tt0328107
{
  "id": "tt0328107",
  "add": 1
}
```
# API with GraphQL
After changing directory to the current one, you can launch the server with:
```sh
❯ node graphQLserver.js
```
You can use the GraphiQL tool to manually issue GraphQL queries. If you navigate in a web browser to http://localhost:4000/graphql, you should see an interface that lets you enter queries.
## Schema

```
type Review{
  date: String
  review: String
}

input ReviewInput{
	date: String!
	review: String!
}

type Movie {
	id: ID!
	link: String
	metascore: Int
	synopsis: String
	title: String
	year: Int
	reviews: [Review]
}

type Query {
	movies(metascore: Int, limit: Int): [Movie]
	movie(id: ID): Movie
}

type Mutation {
	populate: Int
	addReview(id: ID!,review: ReviewInput!): Movie
}
```
## Endpoints of the API
### `Populate the database`
```sh
mutation{
  populate
}
```
It will return the number of documents added to the database
```sh
{
  "data": {
    "populate": 56
  }
}
```
### `Fetch a random must-watch movie`
```sh
{
  movie {
    id,
    title,
    year,
    metascore
  }  
}
```
You can add all the element of a movie that you want (see type Movie)
```sh
{
  "data": {
    "movie": {
      "id": "tt0104797",
      "title": "Malcolm X (1992)",
      "year": 1992,
      "metascore": 72
    }
  }
}
```
### `Fetch a specific movie`
The query movie accepts an id as parameter
```sh
{
  movie(id:"tt0328107"){
    id,
    title,
    year,
    synopsis    
  }  
}
```
It will return the following json:
```sh
{
  "data": {
    "movie": {
      "id": "tt0328107",
      "title": "Man on Fire (2004)",
      "year": 2004,
      "synopsis": "In Mexico City, a former assassin swears vengeance on those who committed an unspeakable act against the family he was hired to protect."
    }
  }
}
```
### `Search for Denzel's movies`
```sh
{
  movies{
    id,
    title,
    year,
    metascore,
    synopsis    
  }  
}
```
The query movie accepts the following optional parameters:
* `limit` - number of movies to return (default: 5)
* `metascore` - filter by metascore (default: 0)
```sh
{
  movies(metascore:77,limit:2){
    id,
    title,
    year,
    metascore,
    synopsis    
  }  
}
```
```sh
{
  "data": {
    "movies": [
      {
        "id": "tt2671706",
        "title": "Fences (2016)",
        "year": 2016,
        "metascore": 79,
        "synopsis": "A working-class African-American father tries to raise his family in the 1950s, while coming to terms with the events of his life."
      },
      {
        "id": "tt0115956",
        "title": "À l'épreuve du feu (1996)",
        "year": 1996,
        "metascore": 77,
        "synopsis": "A U.S. Army officer, despondent about a deadly mistake he made, investigates a female chopper commander's worthiness for the Medal of Honor."
      }
    ]
  }
}
```
### `Save a watched date and a review.`
```sh
mutation{
  addReview(id: "tt2671706", review: { date:"21/03/2019", review: "very good film" }) {
    id,
    title,
    reviews {
      date
      review
    }
  }
}
```
It will return the following json:
```sh
{
  "data": {
    "addReview": {
      "id": "tt2671706",
      "title": "Fences (2016)",
      "reviews": [
        {
          "date": "25/03/2019",
          "review": "good film"
        },
        {
          "date": "26/03/2019",
          "review": "good film"
        },
        {
          "date": "21/03/2019",
          "review": "very good film"
        }
      ]
    }
  }
}
```
