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
  methods: {
    async load(filename){
      let res = await axios.get(`info/${filename}.md`)
      this.content = marked(res.data)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.load(to.params.filename)
    })
  },
  async beforeRouteUpdate (to, from, next) {
    await this.load(to.params.filename)
    next()
  },
}
</script>

<style lang="css" scoped>
</style>
