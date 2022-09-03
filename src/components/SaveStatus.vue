<template>
  <div class="SaveStatus">
    <v-btn v-if="canSave" @click="$emit('save')" class="ma-2" color="success"
      >Save</v-btn
    >
    <pulse-loader
      v-if="loading"
      :loading="loading"
      color="#1976d2"
      width="300"
      height="100"
    ></pulse-loader>
    <span v-else>{{ saveMesaage }}</span>
  </div>
</template>
<script>
  import PulseLoader from "vue-spinner/src/PulseLoader.vue";
  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en.json";
  TimeAgo.addDefaultLocale(en);
  const timeAgo = new TimeAgo("en-US");
  export default {
    name: "SaveStatus",
    components: {
      PulseLoader
    },
    props: {
      offline: {
        type: Boolean,
        default: false
      },
      lastSaved: {
        type: Number,
        default: null
      },
      loading: {
        type: Boolean,
        default: false
      },
      canSave: Boolean
    },
    mounted() {
      setInterval(() => {
        this.updated = Date.now();
      }, 1000);
    },
    data() {
      return {
        updated: Date.now(),
        message: "Not Saved"
      };
    },
    computed: {
      saveMesaage() {
        if (this.lastSaved && this.updated) {
          const formatted = timeAgo.format(this.lastSaved);
          return `Saved ${formatted}`;
        }
        if (this.offline) {
          return "Offline";
        }
        return this.message;
      }
    }
  };
</script>
<style scoped lang="scss">
  .SaveStatus {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    align-items: center;
    width: 100px;
    min-height: 50px;
    position: fixed;
    right: 20px;
    color: lightgray;
    border: 1px solid lightgray;
  }
</style>
