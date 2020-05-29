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
const iotdata = new AWS.IotData({ endpoint: process.env.IOT_DATA_ENDPOINT })
let iotTopic = ''

// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        if (!record.dynamodb.NewImage) return  // Deletion

        const question = record.dynamodb.NewImage

        // Calculate average score
        const answers = question.answers.N
        const avgScore = answers != 0 ? question.totalScore.N/answers : 0
    
        // Extract coordinates from geoJson
        const coords = JSON.parse(question.geoJson.S).coordinates

        const message = {
          answers: question.answers.N,
          author: question.author.S,
          created: question.created.N,
          hashKey: question.hashKey.N,
          question: question.question.S,
          rangeKey: question.rangeKey.S,      
          state: question.state.S,
          type: question.type.S,
          latitude: coords[1],
          longitude: coords[0],
          avgScore: Math.round((avgScore + Number.EPSILON) * 100) / 100
        }
        
        // If there's an OldImage, the question item was updated (new scores, etc)
        if (record.dynamodb.OldImage) {
          iotTopic = 'new-answer'
        } else { 
          // ... otherwise it's a new question. Use hashKey as topic.
          iotTopic = record.dynamodb.NewImage.hashKey.N
        }
        await iotPublish(iotTopic, message)        
      } catch (err) {
        console.error('Error: ', err)
      }
    })
  )
}

// Publishes the message to the IoT topic
const iotPublish = async function (topic, message) {
  try {
      await iotdata.publish({
          topic,
          qos: 0,
          payload: JSON.stringify(message)
      }).promise();
      console.log('iotPublish success to topic: ', topic, message)
  } catch (err) {
      console.error('iotPublish error:', err)
  }
};