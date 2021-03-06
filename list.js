'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
    TableName: process.env.DYNAMODB_TABLE,
};

module.exports.list = (event, context, callback) => {
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

        // create a response
        const response = {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            statusCode: 200,
            body: `There are ${data.length} levels in the queue`,
        };
        callback(null, response);
    });
};
