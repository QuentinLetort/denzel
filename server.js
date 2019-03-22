const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./src/imdb');
const mongodbConfig =require('./config').mongodbConfig;
const actorsID=require('./config').actorsID;

const DENZEL_ID= actorsID.DENZEL_IMDB_ID;
const CONNECTION_URL = mongodbConfig.URL;
const DATABASE_NAME = "MovieDB";
const PORT=9292;

var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(PORT, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("Movie");
        console.log(`Connected to ` + DATABASE_NAME + ` on the port ${PORT}!`);
    });
});

app.get("/movies/populate", async (request, response) => {
	const movies= await imdb(DENZEL_ID);
    collection.insertMany(movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

app.get("/movies", (request, response) => {
	collection.aggregate([
		{$match: {metascore: {$gte: 70}}},
		{$sample: {size: 1}}
	]).toArray((error, result)=>{
		if(error) {
            return response.status(500).send(error);
        }
        response.send(result[0]);
    });
});

app.get("/movies/search", (request, response) => {
	var limit = request.query.limit;
	var metascore = request.query.metascore;
	if(limit==null) {
		limit = 5;
	}
	if(metascore==null) {
		metascore = 0;
	}
    collection.aggregate([
		{$match: {metascore: {$gte: metascore}}},
		{$limit: limit},
		{$sort: {metascore: -1}}
	]).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movies/:id", (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.post("/movies/:id", async (request, response) => {
    const date=request.body.date;
	const review=request.body.review;
    collection.updateOne(
		{ "id": request.params.id },
		{$addToSet:{
			reviews: {
				"date": date,
				"review": review
			}
		}},(error,result) => {
			if(error) {
				return response.status(500).send(error);
			}
			var modify=result.result.nModified;
			response.send({id:request.params.id, add:modify})
		}
	);
});


