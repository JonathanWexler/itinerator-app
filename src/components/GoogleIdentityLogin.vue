<template>
<span>
  <pulse-loader :loading="loading" color="blue" width="300" height="100" />
  <button v-show="!loggedIn && !loading" @click="onLoginClick">Login</button> 
  <div v-show="loggedIn && !loading">
    {{user.name}}
  </div>
    <button  v-show="loggedIn && !loading" @click="onLoginClick">Logout</button> 
</span>
</template>
<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import axios from 'axios'
export default {
  name: 'ItineratorGoogleIdentityLogin',
  components: {
    PulseLoader
  },
  data() {
    return {
      loggedIn: false,
      loading: false,
      renderParams: {
        // longtitle: true
      },
      user: {

      },
      params: {
        clientId: '319013726287-iph43il9usnh7rosftnorlr5no9tht6r.apps.googleusercontent.com'
      }
    }
  },
  mounted () {
    if (this.getToken()) {
      this.loggedIn = true;
    }
  },
  methods: {
    async onLoginClick () {
      if (this.loggedIn) {
        this.logout();
        return;
      }
      this.loading = true;
      window.google = this;
      const response = await this.$gAuth.signIn();
      if (response) {
        console.log('googleUser', response);
        this.onSuccess(response);
      }
    },
    logout () {
      this.$cookies.set('itinerator-token', null);
      this.loggedIn = false;
      this.loading = false;
    },
    onLogoutSuccess() {
      console.log('Logged out');
      this.loggedIn = false;
    },
    processUser(data) {
      this.loggedIn = true;
      this.user.name = data.Du.tf;
      console.log('USER CURRENT', data)
    },
    onSuccess (response) {
      const {tv: profile, Cc: auth} = response
      console.log('SUCCESS', profile, auth)
      this.serverConfirm({profile, auth})
    },
    onFailure (e) {
      console.log('Failure', e)
    },
    getToken () {
      return this.$cookies.get('itinerator-token')
      // return localStorage.getItem('itinerator-token');
    },
    async serverConfirm(authObject) {
      const {profile, auth} = authObject;
      let URI = 'https://itinerator-api.herokuapp.com';
      if (process.env.NODE_ENV === 'development') {
        URI = 'http://localhost:3000'
      }
      const serverRes = await axios.post(
        `${URI}/auth/google`, {
          token: auth.id_token,
          profile,
          auth,
        })
        if (serverRes) {
          this.$root.$emit('login', serverRes.data)
          this.$cookies.set('itinerator-token', serverRes.data.jwtToken, "30d")
          // localStorage.setItem('itinerator-token', serverRes.data.jwtToken);
        }
        this.loggedIn = true;
        this.loading = false;
    }
  }
}
</script>
<style scoped lang='scss'>
.facebook-login{
  background: #455da8;
}
</style>