/*
  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify,
  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict'

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, process.env.TableName)
config.hashKeyLength = 5

const myGeoTableManager = new ddbGeo.GeoDataManager(config)

// The standard Lambda handler
exports.handler = async (event) => {
  // console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const message = JSON.parse(record.body)
        await saveToDDB(message)
      } catch (err) {
        console.error(`Handler error: ${err}`)
      }
    })
  )
}

// Save single item to DynamoDB
const saveToDDB = async (message) => {
  try {
    const body = JSON.parse(message.body)
    const type = body.type.split(' ')[0]

    // Save to DDB using the dynamodb-geo library
    const result = await myGeoTableManager.putPoint({
      RangeKeyValue: { S: `${message.uid}-${message.created}` }, // Use this to ensure uniqueness of the hash/range pairs.
      GeoPoint: { // An object specifying latitutde and longitude as plain numbers. Used to build the geohash, the hashkey and geojson data
        latitude: parseFloat(body.position.latitude),
        longitude: parseFloat(body.position.longitude)
      },
      PutItemInput: { // Passed through to the underlying DynamoDB.putItem request. TableName is filled in for you.
        Item: { // The primary key, geohash and geojson data is filled in for you
          question: { S: body.question }, // Specify attribute values using { type: value } objects, like the DynamoDB API.
          state: { S: 'open' },
          totalScore: { N: "0" },
          author: { S: message.uid },
          created: { N: message.created.toString() },
          answers: { N: "0" },
          type: { S: type }
        },
        // ... Anything else to pass through to `putItem`, eg ConditionExpression
      }
    }).promise()
    console.log(result)

  } catch (err) {
    console.error(`Error: ${err}`)
  }
}