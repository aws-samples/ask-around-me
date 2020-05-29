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

const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, process.env.TableName)
config.hashKeyLength = 5

const myGeoTableManager = new ddbGeo.GeoDataManager(config)
const SEARCH_RADIUS_METERS = 8000

exports.handler = async (event) => {
  // console.log(JSON.stringify(event, null, 0))

  if (!event.queryStringParameters) {
    return {
      statusCode: 422,
      body: JSON.stringify("Missing parameters")
    }
  }

  const latitude = parseFloat(event.queryStringParameters.lat)
  const longitude = parseFloat(event.queryStringParameters.lng)

  console.log(`Searching for: ${latitude}, ${longitude} with ${SEARCH_RADIUS_METERS} radius`)

  // Get questions within geo range
  const result = await myGeoTableManager.queryRadius({
    RadiusInMeter: SEARCH_RADIUS_METERS,
    CenterPoint: {
      latitude,
      longitude
    }
  })

  console.log('Result: ', result)

  // Reformat output, add avg scores
  const questions = result.map((question) => {

    const answers = question.answers.N
    const avgScore = answers != 0 ? question.totalScore.N/answers : 0

    // Extract coordinates from geoJson
    const coords = JSON.parse(question.geoJson.S).coordinates
    const longitude = coords[0]
    const latitude = coords[1]

    return {
      question: question.question.S,
      created: question.created.N,
      state: question.state.S,
      type: question.type.S,
      latitude,
      longitude,
      rangeKey: question.rangeKey.S,      
      hashKey: question.hashKey.N,
      answers: question.answers.N,
      avgScore: Math.round((avgScore + Number.EPSILON) * 100) / 100,
      author: question.author.S
    }
  })

  console.log('Returning questions: ', questions)

  return {
    statusCode: 200,
    body: JSON.stringify(questions)
  }
}