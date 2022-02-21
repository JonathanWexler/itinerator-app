import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import cookies from './plugins/cookies'

Vue.config.productionTip = false

new Vue({
  vuetify,
  cookies,
  render: h => h(App)
}).$mount('#app')
