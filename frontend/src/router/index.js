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
import VueRouter from 'vue-router'
import AskView from '../views/AskView.vue'
import HomeView from '../views/HomeView.vue'
import Answers from '@/views/Answers.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/ask',
    name: 'AskView',
    component: AskView
  },
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },  
  {
    path: '/answers',
    name: 'Answers',
    component: Answers
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
})

export default router
