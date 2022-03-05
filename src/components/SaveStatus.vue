<template>
  <div class="SaveStatus">
    {{saveMesaage}}
  </div>
</template>
<script>
export default {
  name: 'SaveStatus',
  props: {
    lastSaved: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      message: 'Not Saved',
    }
  },
  computed: {
    saveMesaage () {
      if (this.lastSaved) {
        return `Saved ${this.lastSaved}`
      }
      return this.message;
    }
  }
}
</script>
<style scoped lang='scss'>
.SaveStatus{
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  width: 100px;
  height: 50px;
  position: absolute;
  right: 40px;
  color: lightgray;
  border: 1px solid lightgray;
}
</style>