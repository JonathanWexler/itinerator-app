import Vue from 'vue'
import GAuth from 'vue-google-oauth2'
const gAuthOption = {
  clientId: '319013726287-iph43il9usnh7rosftnorlr5no9tht6r.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account'
}

Vue.use(GAuth, gAuthOption)