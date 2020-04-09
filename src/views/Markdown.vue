<template lang="pug">
v-app
  v-content
    v-container
      .markdown-body(v-html='content')
</template>

<script>
import axios from 'axios'
import marked from 'marked'
export default {
  data(){
    return {
      content: ''
    }
  },
  async created(){
    console.log(this.$route)
    let res = await axios.get(`/info/${this.$route.params.filename}.md`)
    this.content = marked(res.data)
  }
}
</script>

<style lang="css" scoped>
</style>
