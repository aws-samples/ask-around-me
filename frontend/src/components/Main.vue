<template>
  <v-app id="app">
 
  </v-app>
</template>

<script>
  export default {
    props: {
      source: String,
    },

    data: function () {
      return {
        appName: this.$appName,
        drawer: null
      }
    },
  }
</script>