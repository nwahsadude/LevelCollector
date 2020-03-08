'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    const timestamp = new Date().getTime();
    let queryString = event.queryStringParameters;


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
        },
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
            return !value.skipped && !value.cleared && queryString.levelCode === value.levelCode
        });


        if(data.length === 0){

            // write the todo to the database
            dynamoDb.put(params, (error) => {
                // handle potential errors
                if (error) {
                    console.error(error);
                    callback(null, {
                        statusCode: error.statusCode || 501,
                        headers: { 'Content-Type': 'text/plain' },
                        body: 'Couldn\'t create the todo item.',
                    });
                    return;
                }

                // create a response
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(params.Item),
                };
                callback(null, response);
            });
        } else {
            const response = {
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                statusCode: 200,
                body: `@${queryString.userName} this level has already been submitted`
            };
            callback(null, response);
        }



    });



};
