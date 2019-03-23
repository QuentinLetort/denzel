const graphqlHTTP = require('express-graphql');
const {buildSchema} = require('graphql');

const express = require('express');
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./src/imdb');
const mongodbConfig =require('./config').mongodbConfig;
const actorsID=require('./config').actorsID;

const DENZEL_ID= actorsID.DENZEL_IMDB_ID;
const CONNECTION_URL = mongodbConfig.URL;
const DATABASE_NAME = "MovieDB";
const PORT=4000;

var schema = buildSchema(`
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
`);

var root = {
	movie: async({id}) => {
		if(id!=null){
			return await collection.findOne({ "id": id });  
		}
		else{
			var movie=await collection.aggregate([
						{$match: {metascore: {$gte: 70}}},
						{$sample: {size: 1}}]).toArray();
			return movie[0];
		}        
	},
	movies: async({metascore,limit}) => {
		return await collection.aggregate([
			{$match: {metascore: {$gte: (metascore||0)}}},
			{$limit: (limit||5)},
			{$sort: {metascore: -1}}
		]).toArray();
	},
	addReview: async({id,review}) => {
		await collection.updateOne(
			{"id": id},
			{$addToSet:{reviews: {
				"date": review.date,
				"review": review.review
			}}}
		);
		return await collection.findOne({ "id": id });
	},
	populate: async function(){
        var movies = await imdb(DENZEL_ID);
		var before=await collection.countDocuments();
        await collection.insertMany(movies);
		var after=await collection.countDocuments();
		return after-before;
    }
};

var app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

var database, collection;

app.listen(PORT, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("Movie");
        console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
    });
});

