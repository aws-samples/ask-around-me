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
// Sets a bounding box around an area in Virginia, USA 
const bounds = {
  latMax: 38.735083,
  latMin: 40.898677,
  lngMax: -77.109339,
  lngMin: -81.587841
}

const generateRandomData = (userContext, events, done) => {
  const randomLat = ((bounds.latMax-bounds.latMin) * Math.random()) + bounds.latMin
  const randomLng = ((bounds.lngMax-bounds.lngMin) * Math.random()) + bounds.lngMin

  const id = parseInt(Math.random()*1000000)+1  //random 0-1000000
  const rating = parseInt(Math.random()*5)+1    //returns 1-5

  userContext.vars.lat = randomLat.toFixed(7)
  userContext.vars.lng = randomLng.toFixed(7)
  userContext.vars.id = id
  userContext.vars.rating = rating

  return done()
}

module.exports = {
  generateRandomData
}

