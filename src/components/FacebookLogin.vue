<template>
  <v-facebook-login
    :app-id="appId"
    login="Login to Facebook"
    @login="loginEvent"></v-facebook-login>
  <!-- <v-btn class="facebook-login" color="#455da8" @click="logInWithFacebook">
    Login with Facebook
  </v-btn> -->
</template>
<script>
import VFacebookLogin from 'vue-facebook-login-component'
import axios from 'axios'
export default {
  name: 'FacebookLogin',
  components: {
    VFacebookLogin
  },
  data() {
    return {
      appId: '475767320738903'
    }
  },
  methods: {
    async loginEvent(authObject) {
      const {userID, accessToken, refreshToken} = authObject.authResponse;
      console.log('GOT', userID, accessToken, refreshToken, authObject)
      
      const serverRes = await axios.post(
        'http://localhost:3000/auth/facebook', {
          accessToken,
          userID,
          refreshToken
        })
        console.log('serverRes', serverRes)
    }
  }
}
</script>
<style scoped lang='scss'>
.facebook-login{
  background: #455da8;
}
</style>