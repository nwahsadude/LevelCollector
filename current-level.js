'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
    TableName: process.env.DYNAMODB_TABLE,
};

module.exports.currentLevel = (event, context, callback) => {
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
            return !value.completed && !value.skipped && !value.cleared
        });
        data.sort((a, b) => {
            return a.createdAt - b.createdAt
        });
        let responseText;

        if(data.length > 0){
            responseText = `The current level code is ${data[0].levelCode.toUpperCase()}`
        } else {
            responseText = "There are no levels"
        }
        // create a response
        const response = {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            statusCode: 200,
            body: responseText,
        };
        callback(null, response);
    });
};
