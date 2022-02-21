<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://i.imgur.com/0JQNulc.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="App Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://i.imgur.com/P3JJtlS.png"
          width="200"
        />
      </div>  

      <v-spacer></v-spacer>
      <itinerator-google-login />
    </v-app-bar>

    <v-main>
      <Dashboard/>
    </v-main>
  </v-app>
</template>

<script>
import Dashboard from './components/Dashboard';
import ItineratorGoogleLogin from './components/GoogleLogin'

export default {
  name: 'App',

  components: {
    Dashboard,
    ItineratorGoogleLogin
  },

  data: () => ({
    //
  }),
};
</script>
