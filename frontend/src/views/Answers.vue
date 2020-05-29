<template>

  <v-container class="pa-0 ma-0">

    <!-- Loading spinner -->
    <v-container v-if="loading" >
      <div class="text-center">
        <v-progress-circular
          :size="50"
          color="orange"
          indeterminate
        ></v-progress-circular>        
      </div>  
    </v-container>

    <!-- Questions list for authenticated users -->
    <v-container class="pa-0 ma-0" id="answersMap" v-if="!loading">

      <GmapMap
          :center="{lat:this.currentLat, lng:this.currentLng}"
          :zoom="7"
          map-type-id="roadmap"
          style="width: 100%; height: 80vh;"
          :options="{
            zoomControl: true,
            zoom: 11,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            disableDefaultUI: false
          }"
        > 
          <!-- <GmapRectangle 
            :key="index"
            v-for="(m, index) in blocks"
            :bounds="{north: m.north, south: m.south, east: m.east, west: m.west}"
            :options="{
              fillColor: m.color,
              fillOpacity: .6,
              strokeColor: m.color,
              strokeOpacity: .1,
              strokeWeight: 1
            }"            
          /> -->
          <GmapCircle
            :key="index"
            v-for="(m, index) in blocks"
            :center="{lat: m.center.lat, lng: m.center.lng}"
            :radius="(250+(1500*m.pct))"
            :options="{
              fillColor: m.color,
              fillOpacity: 0.8,
              strokeColor: m.color,
              strokeOpacity: 0.8,
              strokeWeight: 2
            }"
          />          
          <GmapCircle
            :center="{lat: currentLat, lng: currentLng}"
            :radius="8000"
            :options="{
              fillColor:'blue',
              fillOpacity:0.1,
              strokeColor: '#0000FF',
              strokeOpacity: 0.2,
              strokeWeight: 5
            }"
          />
        </GmapMap>     

    </v-container>

    <!-- Back icon -->
    <v-container class="pa-0 ma-0">
      <v-btn 
        v-if="$auth.isAuthenticated" 
        fixed
        dark
        fab
        bottom
        right
        color="gray"
        class="mb-4"
        to="/">
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </v-container>    

  </v-container>
</template>

<script>
  import axios from "axios"
  const geohash = require('ngeohash')
  const ignore = ['answers','totalScore','geohash','question','geoJson','hashKey','created','rangeKey','type','state','author']

  export default {
    name: "Answers",
    components: {
    },
    data: function () {   
      return {
        currentLat: 40.7358235,
        parentHeight: 600,
        currentLng: -73.9927102,
        loading: true,        
        hk: null,
        rk: null,
        blocks:[]
      }
    },
    async mounted () {
      console.log('mounted')
      console.log(this.$route.query)
      this.hk = this.$route.query.hk
      this.rk = this.$route.query.rk
      this.parentHeight = this.$parent.$el.offsetHeight;      
      if (this.hk && this.rk) await this.loadAnswers()
      
    },
    methods: {
      async loadAnswers() {
        console.log('loadAnswers called')

        const url = `${this.$APIurl}/geoQuestion?hk=${this.hk}&rk=${this.rk}`
        const token = await this.$auth.getTokenSilently();
        console.log('URL: ', url)
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`    // send the access token through the 'Authorization' header
          }
        })
        console.log('Response: ', data)

        const questionLoc = (JSON.parse(data.geoJson.S)).coordinates
        this.currentLng = questionLoc[0]
        this.currentLat = questionLoc[1]

        // Remove non-hash attribs from response
        ignore.map((attrib) => delete data[attrib])

        // Get totalVotes
        let totalVotes = 0
        for (let hash in data) {
          totalVotes += parseInt(data[hash].N)
        }

        // Returns gradient for value of 0-1
        function getColor(value){
          let hue=((1-value)*240)
          return `hsl(${hue},100%,50%)`
        }

        // Set color
        for (let hash in data) {
          data[hash].percent = data[hash].N / totalVotes
          // console.log(data[hash].N, totalVotes)
          data[hash].color = getColor(data[hash].percent)
        }

        // Get geohashes
        for (let hash in data) {
          const coords = geohash.decode_bbox(hash)

          // Maps bounds logic: https://developers.google.com/maps/documentation/javascript/reference/coordinates#LatLngBoundsLiteral
          this.blocks.push({
            north: coords[0],
            south: coords [2],
            east: coords[3],
            west: coords[1],
            color: data[hash].color,
            pct: data[hash].percent,
            center: {
              lat: (coords[0]+coords[2])/2,
              lng: (coords[1]+coords[3])/2
            }
          })
        }
          // console.log(data)

        this.loading = false
      }

    }
  }
</script>
