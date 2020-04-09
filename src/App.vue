<template lang="pug">
  router-view
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>

<style lang='stylus'>
  @import('~github-markdown-css/github-markdown.css')
  .theme--light.v-card > .v-card__text.markdown-body
    color: black
  .theme--dark.v-card > .v-card__text.markdown-body
    color: white
</style>
