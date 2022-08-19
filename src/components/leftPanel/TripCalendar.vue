<template>
  <section>
    <v-date-picker
      :disabled="disabledModifyDateCheckbox && hasDates"
      ref="picker"
      dark
      show-adjacent-months
      range
      no-title
      v-model="dates"
      @change="$emit('emit-dates', $event)"
    >
    </v-date-picker>
    <v-btn
      class="modify-cal-button"
      v-if="activeButtonKey && disabledModifyDateCheckbox"
      @click="$emit('disable-modify-date', !disabledModifyDateCheckbox)"
      color="secondary"
      >Modify Calendar</v-btn
    >
    <v-btn
      class="modify-cal-button"
      v-if="activeButtonKey && !disabledModifyDateCheckbox"
      @click="$emit('save-modified-dates', dates)"
      color="success"
      >Save New Dates</v-btn
    >
  </section></template
>

<script>
  export default {
    name: "TripCalendar",
    watch: {
      selectedDates(newValue, oldValue) {
        console.log("CHECKING change");
        if (newValue && newValue !== oldValue) {
          console.log("TAKING change", newValue, oldValue);
          this.dates = this.selectedDates.split(",");
        }
      }
    },
    data() {
      return {
        dates: null
      };
    },
    props: {
      selectedDates: {
        type: String
      },
      disabledModifyDateCheckbox: {
        type: Boolean,
        default: false
      },
      hasDates: {
        type: Boolean,
        default: false
      },
      activeButtonKey: {
        type: String,
        default: ""
      }
    },
    methods: {
      emitDates() {},
      saveModifiedDates() {}
    }
  };
</script>

<style lang="scss" scoped>
  .modify-cal-button {
    margin-top: 10px;
  }
</style>
