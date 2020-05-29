<template>
  <div></div>
</template>

<script>
  import { mapState } from 'vuex'
  let mqttClient

  export default {
    name: 'IoT',
    computed: {
      ...mapState({
        init: (state) => state.initialized,
        hash: (state) => state.hashKey
      })
    },
    watch: {
      // The effect of this is to wait until the user is logged
      // in before making the websocket connection.
      init: function () {
        if (this.init) {
          this.mountIOT()
          console.log('Mounting websocket')
        }
      },
      hash: function() {
        console.log('IoT subscribing to ', this.hash)
        this.subscribe(this.hash)
      }
    },
    methods: {
      subscribe (topic) {
        console.log('IoT subcribing to ', topic)
        mqttClient.subscribe(topic)
      },
      mountIOT () {
        let _store = this.$store

        const AWS = require('aws-sdk')
        const AWSIoTData = require('aws-iot-device-sdk')
        let errorCount = 0

        const AWSConfiguration = {
          poolId: this.$poolId, //'us-east-1:e4803d3b-42d5-496f-9c5a-408f20eb28e4', // 'YourCognitoIdentityPoolId'
          host: this.$host, // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
          region: this.$region // 'YourAwsRegion', e.g. 'us-east-1'
        }

        var currentlySubscribedTopic = 'new-answer'
        var clientId = 'askAroundMe-' + (Math.floor((Math.random() * 100000) + 1))
        AWS.config.region = AWSConfiguration.region

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: AWSConfiguration.poolId
        })

        console.log('IoT created')
        mqttClient = AWSIoTData.device({
          region: AWS.config.region,
          host: AWSConfiguration.host,
          clientId: clientId,
          protocol: 'wss',
          maximumReconnectTimeMs: 8000,
          debug: false,
          accessKeyId: '',
          secretKey: '',
          sessionToken: ''
        })

        const cognitoIdentity = new AWS.CognitoIdentity()
        const getCreds = function () {
          AWS.config.credentials.get(function (err, data) {
            if (!err) {
              console.log('retrieved identity: ' + AWS.config.credentials.identityId, data)
              const params = {
                IdentityId: AWS.config.credentials.identityId
              }
              cognitoIdentity.getCredentialsForIdentity(params, function (err, data) {
                if (!err) {
                  mqttClient.updateWebSocketCredentials(data.Credentials.AccessKeyId,
                    data.Credentials.SecretKey,
                    data.Credentials.SessionToken)
                } else {
                  // console.log('error retrieving credentials: ' + err)
                }
              })
            } else {
              // console.log('error retrieving identity:' + err)
            }
          })
        }

        mqttClient.on('connect', function () {
          console.log('mqttClient connected')
          mqttClient.subscribe(currentlySubscribedTopic)
        })

        mqttClient.on('error', function (err) {
          if (errorCount > 0) {
            console.log('mqttClient error:', err)
          }
          errorCount++
          getCreds()
        })

        mqttClient.on('message', function (topic, payload) {
          const msg = JSON.parse(payload.toString())
          console.log('IoT msg: ', topic, msg)
          if (topic === 'new-answer') {
            console.log('update')
            _store.commit('updateQuestion', msg)
          } else {
            console.log('New question')
            _store.commit('saveQuestion', msg)
          }
        })
      }
    }
  }
</script>