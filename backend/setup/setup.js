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

// Run this script with your AWS region as the first parameter
// e.g. node ./setup.js us-east-1

const AWS = require('aws-sdk')
AWS.config.update({region: process.argv[2]})

const ddb = new AWS.DynamoDB() 
const ddbGeo = require('dynamodb-geo')

// Configuring constants
const DDB_TABLENAME = 'aamQuestions'
const config = new ddbGeo.GeoDataManagerConfiguration(ddb, DDB_TABLENAME)
config.hashKeyLength = 5

// Use GeoTableUtil to help construct a CreateTableInput.
const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config)

// Tweak the schema as desired
delete createTableInput.ProvisionedThroughput
createTableInput.BillingMode = 'PAY_PER_REQUEST'
createTableInput.StreamSpecification = {
  StreamEnabled: true,
  StreamViewType: 'NEW_AND_OLD_IMAGES'
}

console.log('Creating table with schema:')
console.dir(createTableInput, { depth: null })

// Create the table
ddb.createTable(createTableInput).promise()
  // Wait for it to become ready
  .then(function () { return ddb.waitFor('tableExists', { TableName: config.tableName }).promise() })
  .then(function () { console.log('Table created and ready!') })

