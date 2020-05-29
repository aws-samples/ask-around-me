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

const star = require('./starEvents')
const geo = require('./geoEvents')

const matchItem = (item, type) => {
  try {
    if (item.dynamodb.NewImage) {
      if (item.dynamodb.NewImage.type.S === type) return true
    }
    if (item.dynamodb.OldImage) {
      if (item.dynamodb.OldImage.type.S === type) return true
    }
  } catch (err) {
    console.error('matchItem error: ', err)
  }
  return false
}

// The standard Lambda handler
exports.handler = async (event) => {
  console.log (JSON.stringify(event, null, 2))

  const starEvents = event.Records.filter((item) => (matchItem(item, 'Star')))
  const geoEvents = event.Records.filter((item) =>  (matchItem(item, 'Geo')))

  console.log('Star events: ', starEvents.length)
  console.log('Geo events: ', geoEvents.length)

  if (starEvents.length > 0) {
    const updates = star.aggregateUpdates(starEvents)
    await star.updateQuestionsTable(updates)
  }

  if (geoEvents.length > 0) {
    const updates = geo.aggregateUpdates(geoEvents)
    console.log('Updates: ', updates)
    await geo.updateQuestionsTable(updates)
  }

}

