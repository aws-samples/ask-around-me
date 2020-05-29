<template>
  <div class="home">
    <v-container>
      <v-card class="ma-2">
        <v-card-title class="headline">Ask Around</v-card-title>
        <v-card-subtitle>Enter a question to ask users around you.</v-card-subtitle>

        <v-form class="ma-4"
          ref="form"
          v-model="valid"
          :lazy-validation="lazy"
        >
          <v-text-field
            v-model="question"
            :counter="100"
            :rules="questionRules"
            label="Question"
            required
          ></v-text-field>
    
          <v-select
            v-model="type"
            :items="items"
            :rules="[v => !!v || 'Question type is required']"
            label="Question type"
            required
          ></v-select>
          <v-spacer></v-spacer>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="!valid"
            color="success"
            class="mr-4"
            @click="saveQuestion" text>Submit</v-btn>
            <v-btn color="error"
            class="mr-4"
            @click="reset" text>Cancel</v-btn>
           </v-card-actions>
        </v-form>
      </v-card>    
    </v-container>    
  </div>
</template>

<script>
import axios from "axios"
export default {
  name: 'AskView',
  data: () => ({
    valid: true,
    question: '',
    questionRules: [
      v => !!v || 'Question is required',
      v => (v && v.length <= 100) || 'Question must be less than 100 characters',
    ],
    type: null,
    items: [
      'Star rating',
      'Geo rating',
    ],
    lazy: false
  }),  
  methods: {
    validate () {
      this.$refs.form.validate()
    },
    reset () {
      this.$refs.form.reset()
      this.$router.push('/')
    },
    async saveQuestion() {
      const token = await this.$auth.getTokenSilently();
      const url = `${this.$APIurl}/questions`

      const payload = { 
        question: this.question,
        type: this.type,
        position: this.$store.getters.getPosition
      }
      console.log('URL: ', url)
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
      this.reset()
    }
  }
}
</script>
