<template>
  <v-card fluid shaped outlined class="tab-bar" elevation="12">
    <template slot="progress">
      <v-progress-linear
        color="gold"
        height="10"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-img height="100" :src="imageLink"></v-img>
    <v-row align="center" class="mx-0 name">
      <v-card-title>{{ name }}</v-card-title>

      <v-icon v-if="highlight" large color="#ffcb3b">
        mdi-star
      </v-icon>
    </v-row>
    <v-card-text>
      <v-row align="center" class="mx-0 time">
        <v-chip label outlined text-color="#1976d2" color="#1976d2">{{
          startTime
        }}</v-chip>
        <span class="hyphen">-</span>
        <v-chip label outlined text-color="#1976d2" color="#1976d2">{{
          endTime
        }}</v-chip>
      </v-row>
      <v-row align="center" class="mx-0">
        <div>{{ description }}</div>
      </v-row>
      <v-row
        align="center"
        class="mx-0"
        v-for="(link, index) in links"
        :key="index"
      >
        <v-icon small color="#1976d2">
          mdi-link
        </v-icon>
        <a class="link" :href="link.value">{{ formatLinkLabel(link.value) }}</a>
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
      <v-btn color="deep-purple lighten-2" text @click="$emit('edit')">
        Edit
      </v-btn>
      <v-btn color="deep-red lighten-2" text @click="$emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
  export default {
    name: "ActivityCard",
    props: {
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
    data() {
      return {
        selection: []
      };
    },
    methods: {
      formatTime(date) {
        let amPm = "AM";
        let minutes = date.getMinutes();
        minutes = minutes < 10 ? "0" + minutes : minutes;
        let hours = date.getHours();
        if (hours >= 12) {
          amPm = "PM";
          if (hours > 12) {
            hours = hours % 12;
          }
        }
        return `${hours}:${minutes} ${amPm}`;
      },
      formatLinkLabel(link) {
        return link.split(".")[1];
      }
    },
    computed: {
      startTime() {
        return this.formatTime(new Date(this.start));
      },
      endTime() {
        return this.formatTime(new Date(this.end));
      },
      imageLink() {
        return (
          this.imageUrl || "https://cdn.vuetifyjs.com/images/cards/cooking.png"
        );
      }
    }
  };
</script>
<style lang="scss" scoped>
  .hyphen {
    padding: 5px;
  }
  .time {
    padding: 5px 0;
  }
  .name {
    display: flex;
    justify-content: space-between;
    padding-right: 10px;
  }
  .link {
    padding: 5px;
  }
</style>
