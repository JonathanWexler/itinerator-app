<template>
  <section class="activities-card">
    <v-card
      class="list-activity"
      v-for="(activityEvent, index) in activities"
      :key="index"
      :color="activityEvent.color"
      @click="$emit('show-event', { event: activityEvent, index })"
    >
      <h1>{{ activityEvent.name }}</h1>
      <h5>{{ activityDateFormat(activityEvent.start) }}</h5>
    </v-card>
  </section>
</template>
<script>
  export default {
    name: "ActivityPanel",
    props: {
      activities: {
        type: Array,
        default: () => []
      }
    },
    methods: {
      activityDateFormat(time) {
        const date = new Date(time);
        const day = date
          .toString()
          .split(" ")
          .slice(0, 3)
          .join(" ");
        return `${day} ${date.toLocaleTimeString()}`;
      }
    }
  };
</script>
<style lang="scss" scoped></style>
