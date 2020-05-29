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

const { S2Cell, S2LatLng } = require('nodes2ts')

// Uses the same library as the NPM DynamoDB Geohash package
// to generate the cell ID for subscription.

const getGeoHashCell = (lat, lng, length) => {
 
  const generateGeohash = (lat, lng) => {
    const latLng = S2LatLng.fromDegrees(lat, lng)
    const cell = S2Cell.fromLatLng(latLng)
    const cellId = cell.id
    return cellId.id
  }

  const generateHashKey = (geohash, hashKeyLength) => {
    if (geohash.lessThan(0)) {
      // Counteract "-" at beginning of geohash.
      hashKeyLength++;
    }

    const geohashString = geohash.toString(10)
    const denominator = Math.pow(10, geohashString.length - hashKeyLength)
    return geohash.divide(denominator)
  }

  const gh = generateGeohash(lat, lng)
  const hashKey = generateHashKey(gh, length)
  return (hashKey.toString(10))
}

module.exports = { getGeoHashCell }

