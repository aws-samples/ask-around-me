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

import Vue from 'vue'
import Vuex from 'vuex'
import geoHash from '@/helpers/geoHash'

Vue.use(Vuex)
const GEOHASH_LENGTH = 5

// initial state
const state = {
  initialized: false,
  position: {
    latitude: '-70.8238872',
    longitude: '43.0385959'
  },
  hashKey: '',
  user: {},
  questions: []
}

// getters
const getters = {
  isInitialized: (state) => state.initialized,
  getPosition: (state) => state.position,
  getUser: (state) => state.user,
  getQuestions: (state) => state.questions,
  getHashKey: (state) => state.hashKey
}

//mutations
const mutations = {
  setPosition(state, position) {
    state.position.latitude = position.coords.latitude
    state.position.longitude = position.coords.longitude;  
    const hash = geoHash.getGeoHashCell(
      position.coords.latitude,
      position.coords.longitude,
      GEOHASH_LENGTH
    )
    state.hashKey = hash
  },
  saveQuestion(state, question) {

    console.log('store::saveQuestion:', question)
    for (let i in state.questions) {
      console.log(state.questions[i])
      if (state.questions[i].rangeKey === question.rangeKey) {
        console.log('Matched: ', question.rangeKey)
        state.questions[i].answers = question.answers
        state.questions[i].avgScore = question.avgScore
        return
      }
    }    
    console.log('Not in store - adding')

    state.questions.push(question)

  },
  setUser(state, user) {
    state.user = user
  },
  setHashKey(state, hashKey) {
    state.hashKey = hashKey
  },  
  setInitialized(state, val) {
    console.log('setInitalized')
    state.initialized = val
  },
  setAllQuestions(state, questions) {
    state.questions = questions
  },
  updateQuestion(state, question) {
    console.log('store::updateQuestion')
    for (let i in state.questions) {
      if (state.questions[i].rangeKey === question.rangeKey) {
        state.questions[i].answers = question.answers
        state.questions[i].avgScore = question.avgScore
        console.log('Updated question: ', state.questions[i].rangeKey)
      }
    }
  }
}

export default new Vuex.Store({
  // strict: true,
  state,
  getters,
  mutations
})
