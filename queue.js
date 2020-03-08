"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.DYNAMODB_TABLE
};

module.exports.queue = (event, context, callback) => {
  // fetch all todos from the database


  let queryString = event.queryStringParameters;
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't fetch the todos."
      });
      return;
    }

    let data = result.Items.filter(value => {
      return !value.completed && !value.skipped && !value.cleared
    });


    if(data.length > 0){
      data.sort((a, b) => {
        return a.createdAt > b.createdAt
      })
    } else {
      return [];
    }

    let position = 0;
    let noLevel = false;

    if(data.length > 0){
      for(let i = 0; i < data.length; i++){
        if(data[i].userName === queryString.userName){
          position = i;
          break;
        } else {
          noLevel = true;
        }

      }
    }

    let returnMessage;

    if(position === 0 && noLevel === true){
      returnMessage = `@${queryString.userName} you have no levels submitted`
    } else {
      returnMessage = `@${queryString.userName} there are ${position} levels before your level`
    }


    // create a response
    const response = {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      statusCode: 200,
      body: returnMessage
    };
    callback(null, response);
  });
};
