<template>
  <v-card fluid shaped outlined class="tab-bar" elevation="12">
    <template slot="progress">
      <v-progress-linear
        color="deep-purple"
        height="10"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-img
      height="150"
      :src="imageLink"
    ></v-img>

    <v-card-title>{{name}}</v-card-title>

    <v-card-text>
      <v-row
        align="center"
        class="mx-0"
      >
          <v-chip color="yellow">{{startTime}}</v-chip>
          <span class="hyphen">-</span>
          <v-chip color="yellow">{{endTime}}</v-chip>
      </v-row>
      <v-row
        align="center"
        class="mx-0"
      >
        <div>{{description}}</div>
      </v-row>
      <v-row
        align="center"
        class="mx-0"
      >
        <a :href="links">{{links}}</a>
      </v-row>
    </v-card-text>

    <v-divider class="mx-4"></v-divider>

    <v-card-title>Notes</v-card-title>

    <v-card-text>
      <v-chip-group
        v-model="selection"
        active-class="deep-purple accent-4 white--text"
        column
      >
        <v-chip>Water</v-chip>

        <v-chip>Outdoors</v-chip>

        <v-chip>Fun</v-chip>

      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-btn
        color="deep-purple lighten-2"
        text
        @click="$emit('edit')"
      >
        Edit
      </v-btn>
      <v-btn
        color="deep-red lighten-2"
        text
        @click="$emit('close')"
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  name: 'ActivityCard',
  props:{
    name: String,
    description: String,
    highlight: Boolean,
    links: Array,
    start: Number,
    end: Number,
    imageUrl: {
      type: String
    }
  },
  data () {
    return {
      selection: []
    }
  },
  methods: {
    formatTime (date) {
      return `${date.getHours()}:${date.getMinutes()}`
    }
  },
  computed: {
    startTime () {
      return this.formatTime(new Date(this.start))
    },
    endTime () {
      return this.formatTime(new Date(this.end))
    },
    imageLink () {
      return this.imageUrl || 'https://cdn.vuetifyjs.com/images/cards/cooking.png'
    }
  }
}
</script>
<style lang="scss" scoped>
.hyphen {
  padding: 5px;
}
</style>