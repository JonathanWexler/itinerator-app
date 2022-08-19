<template>
  <v-card fluid class="tab-bar">
    <v-tabs
      v-model="tab"
      background-color="primary accent-4"
      fixed-tabs
      center-active
      dark
      @change="$emit('tab-click', $event)"
    >
      <v-tabs-slider color="yellow"></v-tabs-slider>
      <v-tab>Calendar</v-tab>
      <v-tab>Activities</v-tab>
    </v-tabs>
  </v-card>
</template>

<script>
  export default {
    name: "TabBar",
    data() {
      return {
        tab: null
      };
    }
  };
</script>

<style lang="scss" scoped>
  .tab-bar {
    width: 100%;
  }
</style>
