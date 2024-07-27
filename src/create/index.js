// index.js

const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');

let ddbOptions = {
  apiVersion: '2012-08-10'
};

if (process.env.AWS_SAM_LOCAL) {
  AWS.config.update({ endpoint: 'http://dynamodb:8000' });
} else {
  AWSXRay.captureAWS(AWS);
}

async function handler(event) {
  let response;
  try {
    const client = new AWS.DynamoDB(ddbOptions);

    const book = JSON.parse(event.body);
    const { isbn, title, year, author, publisher, rating, pages } = book;

    const params = {
      TableName: process.env.TABLE || 'books',
      Item: {
        isbn: { S: isbn },
        title: { S: title },
        year: { N: year.toString() },
        author: { S: author },
        publisher: { S: publisher },
        rating: { N: rating.toString() },
        pages: { N: pages.toString() }
      }
    };

    await client.putItem(params).promise();

    response = {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Book added successfully' })
    };
  } catch (error) {
    response = {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not add book', details: error.message })
    };
  }
  return response;
}

module.exports = { handler };
