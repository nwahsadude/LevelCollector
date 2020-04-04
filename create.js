"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  let queryString = event.queryStringParameters;

  if (queryString.levelCode.length !== 11) {
    const response = {
      statusCode: 200,
      body: `@${queryString.userName} this level code is not valid`
    };
    callback(null, response);
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      levelCode: queryString.levelCode,
      userName: queryString.userName,
      createdAt: timestamp,
      cleared: false,
      skipped: false,
      completed: false
    }
  };

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
      return (
        !value.skipped &&
        !value.cleared &&
        queryString.levelCode === value.levelCode
      );
    });

    let usersLevels = result.Items.filter(value => {
      return (
        !value.skipped &&
        !value.cleared &&
        value.userName === queryString.userName
      );
    });

    if (data.length === 0 && usersLevels.length === 0) {
      dynamoDb.put(params, error => {
        const response = {
          statusCode: 200,
          body: `@${queryString.userName} your level has been submitted!`
        };
        callback(null, response);
      });
    } else if (usersLevels.length === 0 && data.length > 0) {
      const response = {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: `@${queryString.userName} this level has already been submitted`
      };
      callback(null, response);
    } else if (usersLevels.length > 0 && data.length === 0) {
      const response = {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: `@${queryString.userName} please wait until your level has been played before submitting another.`
      };
      callback(null, response);
    }
  });
};
