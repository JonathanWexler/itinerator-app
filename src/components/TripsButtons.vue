<template>
  <div class="trip-buttons">
    <v-btn
      class="ma-2"
      :outlined="'new' !== selected"
      color="success"
      @click="selectItinerary('new')"
    >
      <v-icon medium color="green">mdi-plus-thick</v-icon>
      Journey Doc
    </v-btn>
    <v-btn
      class="ma-1"
      :outlined="itin.key !== selected"
      v-for="(itin, index) in itineraries"
      color="primary"
      :key="index"
      @click="selectItinerary(itin.key)"
    >
      {{ buttonName(itin) }}
    </v-btn>
  </div>
</template>
<script>
  export default {
    name: "TripsButtons",
    props: {
      itineraries: {
        type: Array,
        default: () => []
      },
      selected: {
        type: String
      }
    },
    computed: {},
    methods: {
      buttonName(itin) {
        if (itin.name) return itin.name;
        if (itin.stringifiedDates) {
          return this.formatDates(itin.stringifiedDates.split("_"));
        }
        return "...";
      },
      selectItinerary(key) {
        this.$emit("button-select", key);
      },
      formatDates([first, second]) {
        const [date1, date2] = [new Date(first), new Date(second)];
        if (!first && !second) return "Select Dates";
        else if (!second || first == second) return date1.toDateString();
        return `${date1.toDateString()} to ${date2.toDateString()}`;
      }
    }
  };
</script>
<style lang="scss" scoped>
  .trip-buttons {
    padding-bottom: 20px;
  }
</style>
