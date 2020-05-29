<template>
  <v-container class="pa-0 ma-0">
    <!-- Question card -->
     <v-card class="my-2 ma-2">
      <v-card-text>
        <div class="my-2 subtitle-1">{{ question.question }}</div>

        <!-- Readonly star rating showing aggregated score -->
        <div v-if="question.type==='Star'">
          <v-rating :value="question.avgScore" color="amber" dense half-increments readonly size="24"
          ></v-rating> ({{ question.answers }} ratings)
        </div>

        <div class="my-4 subtitle-2">
          Posted <strong>{{ moment.unix(question.created/1000).fromNow() }}</strong>
          <strong v-if="question.author===$store.getters.getUser.sub"> by you</strong>
        </div>
      </v-card-text>
  
      <!-- Only show "Answer" button for questions asked by different user -->
      <v-card-actions v-if="question.author!=$store.getters.getUser.sub">

        <!-- For star rating questions -->
        <div v-if="question.type==='Star'">
          <v-btn text color="orange" dark @click="openDialog(question)">
            Answer
          </v-btn>
        </div>

        <!-- For geo rating questions -->
        <div v-if="question.type==='Geo'">
          <v-btn text color="orange" dark @click="openMapDialog(question)">
            Answer on map
          </v-btn>
          <v-btn :disabled="question.answers===0" text color="orange" dark :to="{ name: 'Answers', query: { hk: question.hashKey, rk: question.rangeKey }}">
            See results
          </v-btn>
        </div>

        <!-- <v-spacer></v-spacer> -->
      </v-card-actions>
      <v-divider class="mx-4"></v-divider> 
    </v-card> 

    <!-- Popup star rating dialog for answering question -->
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Your rating:</v-card-title>
        <v-card-text>
          <!-- <div class="my-1 subtitle-2">Your rating: </div> -->
          <v-rating v-model="starRating"
            color="amber"
            dense
            half-increments
            size="40"
          ></v-rating>
        </v-card-text>            
        <v-card-actions> 
          <v-spacer></v-spacer>
          <v-btn :disabled="starRating===0||saving===true" color="success" text @click="submitDialog('star')">Submit</v-btn>
          <v-btn :disabled="saving===true" color="error" text @click="dialog=false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Popup geo rating dialog for answering question -->
    <v-dialog v-model="mapDialog" persistent>
      <v-card>
        <v-card-title class="headline">Drop a pin on your answer:</v-card-title>
        <v-card-text>
          <!-- <div class="my-1 subtitle-2">Your rating: </div> -->
          <GmapMap
            ref="gmap"
            :center="{lat:this.position.latitude, lng:this.position.longitude}"
            :zoom="7"
            map-type-id="roadmap"
            style="width: 100%; height: 400px"
            
            :options="{
              zoomControl: false,
              zoom: 11,
              mapTypeControl: false,
              scaleControl: false,
              streetViewControl: false,
              rotateControl: false,
              fullscreenControl: false,
              disableDefaultUI: false
            }"
          > 
            <GmapMarker
              :key="index"
              v-for="(m, index) in markers"
              :position="m.position"
              @click="center=m.position"
            ></GmapMarker>    
            <GmapCircle
              :center="{lat:this.currentQuestion.latitude, lng:this.currentQuestion.longitude}"
              :radius="8000"
              @click="addMarker"
              :options="{
                fillColor:'blue',
                fillOpacity:0.1,
                strokeColor: '#0000FF',
                strokeOpacity: 0.2,
                strokeWeight: 5
              }"
            />
          </GmapMap>     
        </v-card-text>            
        <v-card-actions> 
          <v-spacer></v-spacer>
          <v-btn :disabled="markers.length===0||saving===true" color="success" text @click="submitDialog('geo')">Submit</v-btn>
          <v-btn :disabled="saving===true" color="error" text @click="mapDialog=false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import axios from "axios"
import { mapState } from 'vuex'

export default {
  name: "HomeView",
  props: ['question'],
  data: function () {   
    return {
      dialog: false,
      mapDialog: false,
      markers: [],
      starRating: 0,
      saving: false,
      currentQuestion: {
        latitude: 40.7358235,
        longitude: -73.9927102,
      }
    }
  },
  computed: {
    ...mapState({
      position: (state) => state.position
    })
  },
  methods: {
    openDialog(question) {
      console.log(question)
      this.currentQuestion = question
      this.starRating = 0  // reset rating
      this.dialog = true
    },
    openMapDialog(question) {
      console.log(question)
      this.currentQuestion = question
      this.markers = []
      this.mapDialog = true
    },    
    addMarker(event) {
      const marker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      this.markers.pop() // Only one marker allowed
      this.markers.push({ position: marker })
    },
    async submitDialog(type) {
      console.log('submitDialog')

      const token = await this.$auth.getTokenSilently();
      const url = `${this.$APIurl}/answers`
      this.saving = true

      // Build payload for star/geo type questions
      let payload = {
        question: this.question,
        type
      }

      if (type === 'star') {
        payload.rating = this.starRating
      } else {
        payload.lat = this.markers[0].position.lat
        payload.lng = this.markers[0].position.lng
      }

      console.log('Payload: ', payload)
      try {
        const { data } = await axios.post(url, payload,
          {
            headers: { 
              Authorization: `Bearer ${token}`
            }
          })
        console.log('Result: ', data) 
      } catch (err) {
        console.error('Error: ', err)
      }

      this.dialog = false
      this.mapDialog = false
      this.saving = false
    }
  }
}

</script>
