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

// Mock event
const event = require('./localTestEvent')

// Mock environment variables
process.env.AWS_REGION = 'us-east-1'
process.env.localTest = true
process.env.TableName = 'askAroundMe-httpAPIs-AnswersTable-13KLZPS0W37XT'
process.env.StarQueueURL = 'https://sqs.us-east-1.amazonaws.com/515804667357/askAroundMe-StarAnswersQueue-PT9PF1XJSF8P'
process.env.GeoQueueURL = 'https://sqs.us-east-1.amazonaws.com/515804667357/askAroundMe-GeoAnswersQueue-MEO92AVQ7PAF'

// Lambda handler
const { handler } = require('./post')

const main = async () => {
  console.time('localTest')
  console.dir(await handler(event))
  console.timeEnd('localTest')
}

main().catch(error => console.error(error))