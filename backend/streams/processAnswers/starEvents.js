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
AWS.config.region = process.env.AWS_REGION

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')

// Configuring dynamodb-geo library
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, process.env.TableName)
config.hashKeyLength = 5
const myGeoTableManager = new ddbGeo.GeoDataManager(config)

// Since a stream can contain multiple updates,
// aggregate these first before applying to the
// underlying table.

const aggregateUpdates = (event) => {
  // Helper function to aggregate updates by ID
  const saveUpdate = (update) => {
    if(updates[update.ID]) {
      // Update existing
        updates[update.ID].deltaValue = updates[update.ID].deltaValue += update.deltaValue
        updates[update.ID].deltaAnswers = updates[update.ID].deltaAnswers += update.deltaAnswers 
    } else {
      // Add new
      updates[update.ID] = {
        deltaValue: update.deltaValue,
        deltaAnswers: update.deltaAnswers,
        lat: update.lat,
        lng: update.lng      
      }
    }
  }
 
  let updates = {}
  // Iterate records in the stream batch
  event.map((event) => {
    let NewImage = event.dynamodb.NewImage
    let OldImage = event.dynamodb.OldImage    

    // New answer
    if (event.eventName === 'INSERT') {
      saveUpdate({
        ID: NewImage.PK.S,
        deltaValue: parseInt(NewImage.value.N), 
        deltaAnswers: 1,
        lat: NewImage.latitude.N,
        lng: NewImage.longitude.N        
      })
    }

    // Changed answer
    if (event.eventName === 'MODIFY') {
      saveUpdate({
        ID: NewImage.PK.S,
        deltaValue: parseInt(NewImage.value.N) - parseInt(OldImage.value.N), 
        deltaAnswers: 0,
        lat: NewImage.latitude.N,
        lng: NewImage.longitude.N        
      })
    }

    // Deleted answer
    if (event.eventName === 'REMOVE') {
      saveUpdate({
        ID: OldImage.PK.S,
        deltaValue: -parseInt(OldImage.value.N), 
        deltaAnswers: -1,
        lat: NewImage.latitude.N,
        lng: NewImage.longitude.N        
      })
    }
  })

  return updates
}

// Uses the dynamodb-geo library to update
// existing table items
const updateQuestionsTable = async (updates) => {
  for (const update in updates) {
    let item = updates[update]

    console.log('Updating: ', item)

    const result = await myGeoTableManager.updatePoint({
      RangeKeyValue: { S: update }, 
      GeoPoint: {
        latitude: item.lat,
        longitude: item.lng
      },
      UpdateItemInput: {
        UpdateExpression: 'ADD answers :deltaAnswers, totalScore :deltaTotalScore',
        ExpressionAttributeValues: {
          ':deltaAnswers': { N: item.deltaAnswers.toString()},
          ':deltaTotalScore': { N: item.deltaValue.toString()}
        }
      }
    }).promise()
    console.log(result)
  }
}

module.exports = {
  aggregateUpdates,
  updateQuestionsTable
}