"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: process.env.DYNAMODB_TABLE,
};
module.exports.complete = (event, context, callback) => {

  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todos.',
      });
      return;
    }

    const data = result.Items.filter(value => {
      return !value.completed
    });


    data.forEach(value => {
      const updateParams = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          id: value.id
        },
        ExpressionAttributeValues: {
          ":completed": true
        },
        UpdateExpression: "SET completed = :completed",
        ReturnValues: "ALL_NEW"
      };

      dynamoDb.update(updateParams, (error, result) => {
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
    })

    const response = {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      statusCode: 200
    };
    callback(null, response);
  });

};
