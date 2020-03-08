"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.complete = (event, context, callback) => {
  const data = JSON.parse(event.body);

  // validation
  if (typeof data.ids.length <= 0) {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't update the todo item."
    });
    return;
  }

  console.log(data.ids);

  data.ids.forEach(item => {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        id: item.id
      },
      ExpressionAttributeValues: {
        ":completed": true
      },
      UpdateExpression: "SET completed = :completed",
      ReturnValues: "ALL_NEW"
    };

    // update the todo in the database
    dynamoDb.update(params, (error, result) => {
      // handle potential errors
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't fetch the todo item."
        });
        return;
      }
    });
  });

  // create a response
  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    statusCode: 200,
    body: "cleared list"
  };
  callback(null, response);
};
