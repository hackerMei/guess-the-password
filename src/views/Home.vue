<template lang="pug">
v-app
  v-app-bar(app="" color="primary" dark="")
    v-toolbar-title 交个朋友吧
    v-spacer
    v-btn(text="", @click='dialog=true')
      span.mr-2 注册/登录
  v-content
    v-container
      v-row
        v-col
          v-alert(outlined, prominent, type='info', icon='mdi-alert', dismissible)
            v-row(align='center')
              v-col.grow 这里的用户数据都是虚构的，由程序随机生成，目的是为了演示如何猜测密码。
      v-row
        v-col(v-for='user in users',:key='user.idcard' lg='3', xl='2' md='4', sm='6', xs='12', cols='12')
          v-card(@click='showUserInfo(user)')
            v-list-item
              v-list-item-avatar(:size='48', color="grey lighten-2")
                v-img(:src='user.avatar')
              v-list-item-content
                v-list-item-title.headline {{ user.name }}
                v-list-item-subtitle {{ user.username }}
            v-card-text
              div 邮箱：{{ user.email }}
              div 身份证：{{ user.idcard }}
              div 地址：{{ user.addr }}
              div 手机：{{ user.phone }}
  v-dialog(v-model='dialog', max-width="480", persistent)
    v-card.elevation-12
      v-toolbar(color='primary', dark, flat)
        v-toolbar-title 登录
        v-spacer
        v-btn(icon, text, @click='dialog=false')
          v-icon mdi-close
      v-card-text
        v-form
          v-text-field(
            v-model='username',
            label='用户名',
            name='login',
            prepend-icon='mdi-account',
            type='text')
          v-text-field(
            v-model='password'
            label='密码',
            name='password',
            prepend-icon='mdi-lock',
            type='password'
            )
      v-card-actions
        v-spacer
        v-btn(color='primary', @click='login') 登录
  v-dialog(v-model='userInfoDialog', max-width='375')
    v-card.mx-auto(v-if='user')
      v-img.blue.align-end(
        height='150px',
        :src='user.avatar',
        :contain='true',
        position='center right')
        v-card-title.white--text {{ user.name }}
        v-card-subtitle.white--text {{ user.username }}
      v-list(two-line)
        v-list-item(@click='')
          v-list-item-icon
            v-icon(color='primary') mdi-phone
          v-list-item-content
            v-list-item-title {{ user.phone || '未填写' }}
            v-list-item-subtitle 手机号
        v-divider(inset)
        v-list-item(@click='')
          v-list-item-icon
            v-icon(color='primary') mdi-email
          v-list-item-content
            v-list-item-title {{ user.email || '未填写' }}
            v-list-item-subtitle 邮箱
        v-divider(inset)
        v-list-item(@click='')
          v-list-item-icon
            v-icon(color='primary') mdi-map-marker
          v-list-item-content
            v-list-item-title {{ user.addr || '未填写' }}
            v-list-item-subtitle 地址
        v-divider(inset)
        v-list-item(@click='')
          v-list-item-icon
            v-icon(color='primary') mdi-card-account-details
          v-list-item-content
            v-list-item-title {{ user.idcard || '未填写' }}
            v-list-item-subtitle 身份证
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import marked from 'marked'
import users from '@/assets/data.json'
import Avatars from '@dicebear/avatars';
import sprites from '@dicebear/avatars-avataaars-sprites';
const avatars = new Avatars(sprites, {})
export default {
  name: 'Home',
  data(){
    return {
      dialog: false,
      userInfoDialog: false,
      username: '',
      password: '',
      users,
      user: null
    }
  },
  created(){
    for(let user of this.users){
      user.avatar = this.generateAvatar(user.idcard)
    }
  },
  components: {
    HelloWorld
  },
  methods: {
    login(){
      let user = users.find(user=>user.username==this.username)
      if(this.password === user.password){
        alert('密码正确')
      }else{
        alert('密码错误')
      }
    },
    generateAvatar(seed){
      let svg = new Blob([avatars.create(seed)], {type : 'image/svg+xml'})
      return URL.createObjectURL(svg)
    },
    showUserInfo(user){
      this.user = user
      this.userInfoDialog = true
    }
  },
  filters: {
    marked,
  }
}
</script>
