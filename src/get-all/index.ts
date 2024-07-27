// index.js

const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');

// Configuration for DynamoDB
const ddbOptions = {
  apiVersion: '2012-08-10'
};

// Configure AWS SDK
if (process.env.AWS_SAM_LOCAL) {
  AWS.config.update({ endpoint: 'http://dynamodb:8000' });
} else {
  AWSXRay.captureAWS(AWS);
}

async function handler(event) {
  let response;
  try {
    const client = new AWS.DynamoDB(ddbOptions);

    const params = {
      TableName: process.env.TABLE || 'books'
    };

    // Scan the DynamoDB table
    const result = await client.scan(params).promise();

    // Map DynamoDB items to the desired format
    const bookDtos = result.Items.map(item => ({
      isbn: item.isbn.S,
      title: item.title.S,
      year: parseInt(item.year.N, 10),
      author: item.author.S,
      publisher: item.publisher.S,
      rating: parseInt(item.rating.N, 10),
      pages: parseInt(item.pages.N, 10)
    }));

    response = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookDtos)
    };

  } catch (error) {
    response = {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not retrieve books', details: error.message })
    };
  }
  return response;
}

module.exports = { handler };
