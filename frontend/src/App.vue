<template>
  <v-app>
    <!-- // App bar -->
    <v-app-bar app color="primary" dark>
      <!-- Logo -->
      <div class="d-flex align-center">
        <v-img
          alt="Ask Around Me"
          class="shrink mr-2"
          contain
          src="./assets/ask-around-me-wide.png"
          transition="scale-transition"
          width="160"
        />
      </div>

      <v-spacer></v-spacer>

      <!-- Check that the SDK client is not currently loading before accessing is methods -->
      <div v-if="!$auth.loading">
        <!-- show login when not authenticated -->
        <v-btn text v-if="!$auth.isAuthenticated" @click="login">
          <span class="mr-2">Log in</span>
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
        <!-- show logout when authenticated -->
        <v-btn text v-if="$auth.isAuthenticated" @click="logout">
          <span class="mr-2">Log out</span>
          <v-icon>mdi-account-arrow-right</v-icon>
        </v-btn>
      </div>

    </v-app-bar>

    <!-- Main content -->
    <v-content>
      <v-container class="pa-0 ma-0">
        <!-- Inject view from current path here -->
        <router-view v-if="authReady"></router-view>
      </v-container>
    </v-content>
    <iot/>
  </v-app>
</template>

<script>
import { bus } from '@/main'

export default {
  name: 'App',
  data: function () {
    return {
      authReady: false
    }
  },
  created () {
    bus.$on('loaded', async () => {
      console.log('Auth loaded')
      this.$store.commit('setInitialized', true)      
      this.authReady = true
    })
  },
  methods: {
    // Log the user in
    login() {
      this.$auth.loginWithRedirect();
    },
    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      })
    }
  }  
}
</script>
