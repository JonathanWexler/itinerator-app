<template>
  <span>
    <pulse-loader
      :loading="loading"
      color="blue"
      width="300"
      height="100"
    ></pulse-loader>
    <GoogleLogin
      v-show="!loggedIn && !loading"
      :params="params"
      :onSuccess="onSuccess"
      :onFailure="onFailure"
      :renderParams="renderParams"
      :onCurrentUser="processUser"
    >
      Login
    </GoogleLogin>
    <div v-show="loggedIn && !loading">
      {{ user.name }}
    </div>
    <GoogleLogin
      v-show="loggedIn && !loading"
      :params="params"
      :onSuccess="onLogoutSuccess"
      :renderParams="renderParams"
      :logoutButton="true"
      :onCurrentUser="processUser"
    >
      Logout
    </GoogleLogin>
  </span>
</template>
<script>
  import PulseLoader from "vue-spinner/src/PulseLoader.vue";
  import GoogleLogin from "vue-google-login";
  import axios from "axios";
  export default {
    name: "ItineratorGoogleLogin",
    components: {
      GoogleLogin,
      PulseLoader
    },
    data() {
      return {
        loggedIn: false,
        loading: false,
        renderParams: {
          // longtitle: true
        },
        user: {},
        params: {
          clientId:
            "319013726287-iph43il9usnh7rosftnorlr5no9tht6r.apps.googleusercontent.com"
        }
      };
    },
    mounted() {
      console.log("token", this.getToken());
    },
    methods: {
      onLogoutSuccess() {
        console.log("Logged out");
        this.loggedIn = false;
      },
      processUser(data) {
        this.loggedIn = true;
        this.user.name = data.Du.tf;
        console.log("USER CURRENT", data);
      },
      onSuccess(response) {
        const { Du: profile, wc: auth } = response;
        console.log("SUCCESS", profile, auth);
        this.loading = true;
        this.serverConfirm({ profile, auth });
      },
      onFailure(e) {
        console.log("Failure", e);
      },
      getToken() {
        return this.$cookies.get("itinerator-token");
        // return localStorage.getItem('itinerator-token');
      },
      async serverConfirm(authObject) {
        const { profile, auth } = authObject;
        // const {userID, accessToken, refreshToken} = authObject.authResponse;
        let URI = "https://itinerator-api.herokuapp.com";
        if (process.env.NODE_ENV === "development") {
          URI = "http://localhost:3000";
        }
        const serverRes = await axios.post(`${URI}/auth/google`, {
          token: auth.id_token,
          profile,
          auth
        });
        if (serverRes) {
          this.$root.$emit("login", serverRes.data);
          this.$cookies.set("itinerator-token", serverRes.data.jwtToken, "30d");
          // localStorage.setItem('itinerator-token', serverRes.data.jwtToken);
        }
        this.loggedIn = true;
        this.loading = false;
      }
    }
  };
</script>
<style scoped lang="scss">
  .facebook-login {
    background: #455da8;
  }
</style>
