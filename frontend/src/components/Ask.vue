<template>
    <div id="ask">
        <p>Ask</p>
    </div>
</template>
<script>
  export default {
    props: {
      source: String,
    },

    data: function () {
      return {
        appName: this.$appName,
        drawer: null
      }
    },
  }
</script>