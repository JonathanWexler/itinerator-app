<template>
  <v-app>
    <title>JOURNEY DOC</title>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://i.imgur.com/0JQNulc.png"
          transition="scale-transition"
          width="40"
        />
        <h1>JOURNEY DOC</h1>
        <!-- <v-img
          alt="App Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://i.imgur.com/P3JJtlS.png"
          width="200"
        /> -->
      </div>

      <v-spacer></v-spacer>
      <itinerator-google-identity-login @login="saveAuthorization" />
    </v-app-bar>

    <v-main>
      <Dashboard :auth="auth" />
    </v-main>
  </v-app>
</template>

<script>
  import Dashboard from "./components/Dashboard";
  import ItineratorGoogleIdentityLogin from "./components/GoogleIdentityLogin";

  export default {
    name: "App",
    data() {
      return {
        auth: null
      };
    },
    components: {
      Dashboard,
      ItineratorGoogleIdentityLogin
    },
    methods: {
      saveAuthorization(auth) {
        this.auth = auth;
      }
    }
  };
</script>
