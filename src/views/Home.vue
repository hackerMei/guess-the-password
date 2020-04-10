<template lang="pug">
v-app(dark)
  v-app-bar(app="" color="primary" dark="")
    v-toolbar-title 猜密码
    v-spacer
    v-btn(text="", @click='dialog=true')
      span.mr-2 注册/登录
  v-content
    v-container
      v-row
        v-col
          v-alert(outlined, prominent, type='info', icon='mdi-alert', dismissible, color='primary')
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
              div 生日：{{ user.idcard.substring(6, 10)}}年{{ user.idcard.substring(10, 12)}}月{{ user.idcard.substring(12, 14)}}日
              div 手机：{{ user.phone }}
              v-chip.mt-1.mr-2(v-for='t of user.tags',:key='t', :color='colorHash(t)', dark) {{ t }}
  v-dialog(v-model='dialog', max-width="480", persistent)
    v-card.elevation-12
      v-toolbar(color='primary', dark, flat)
        v-toolbar-title 登录
        v-spacer
        v-btn(icon, text, @click='dialog=false')
          v-icon mdi-close
      v-card-text
        v-form.mt-5(lazy-validation, ref='form', v-model="valid", @submit='login')
          v-text-field(
            @input='reset'
            v-model='username',
            :rules='[ v=>!!v || "请输入用户名" ]'
            label='用户名',
            name='login',
            prepend-icon='mdi-account',
            type='text'
            :error-messages='nameErrorMessages'
            )
          v-text-field(
            @focus = 'reset()',
            @input='reset()'
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            v-model='password',
            :hint='hint'
            label='密码',
            name='password',
            prepend-icon='mdi-lock',
            :type="showPassword ? 'text' : 'password'"
            :loading = 'loading',
            :error-messages='pwErrorMessages'
            )
            template(#message)
              span(v-html='message')
      v-card-actions
        v-spacer
        v-btn(color='primary', @click='login',:loading='loading', :disabled='loading || !valid') 登录
  v-dialog(v-model='userInfoDialog', max-width='375')
    v-card.mx-auto(v-if='user')
      v-img.primary.align-end(
        height='150px',
        :src='user.avatar',
        :contain='true',
        position='center right')
        v-card-title.white--text {{ user.name }}
        v-card-subtitle.white--text(
          v-clipboard:copy="user.username"
          v-clipboard:success="()=>$toasted.show('用户名已复制到剪切板')"
          ) {{ user.username }}
      v-list(two-line)
        template(v-for='item,index of fields', )
          v-list-item(:key='item.key' @click='', v-clipboard:copy="user[item.key]", v-clipboard:success="()=>$toasted.show('已复制到剪切板')")
            v-list-item-icon
              v-icon(color='primary') mdi-{{item.icon}}
            v-list-item-content
              v-list-item-title {{ user[item.key] || '未填写' }}
              v-list-item-subtitle {{ item.name}}
          v-divider(inset, v-if='index !== fields.length-1')
  v-dialog(v-model='successDialog', max-width='960', persistent)
    v-card
      v-card-title 恭喜，密码正确
        v-spacer
        v-btn(@click='successDialog = false',icon)
          v-icon mdi-close
      v-card-subtitle.d-flex.align-center 难度：
        v-rating(:value='rating', readonly, background-color="orange lighten-3" color="orange")
      v-card-text
        .markdown-body(v-html='successInfo')
      v-card-actions
        v-btn(color='primary', text, @click='successDialog = false') 好的
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import marked from 'marked'
import users from '@/assets/data.json'
import Avatars from '@dicebear/avatars';
import sprites from '@dicebear/avatars-avataaars-sprites'
import sample from 'lodash/sample'
import sampleSize from 'lodash/sampleSize'
import debounce from 'lodash/debounce'
import random from 'lodash/random'
import unionBy from 'lodash/unionBy'
import axios from 'axios'
import { nanoid } from 'nanoid'
import ColorHash from 'color-hash'
const colorHash = new ColorHash({saturation: 1})
const avatars = new Avatars(sprites, {})
function wait(s){
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, s*1000)
  })
}
export default {
  name: 'Home',
  data(){
    let _users = sampleSize(users, 50)
    _users = unionBy(_users, u=>u.username)
    for(let u of _users){
      u.avatar = this.generateAvatar(u.idcard)
    }
    return {
      fields: [
        { key: 'phone', icon: 'phone', name: "手机"}, { key: 'email', icon: 'email',name:'邮箱'},
        { key: 'addr', icon: 'map-marker', name: '地址'}, { key: 'idcard', icon: 'card-account-details', name: "身份证"}
      ],
      loading: false,
      valid: false, //密码正确
      dialog: false,
      userInfoDialog: false,
      successDialog: false,
      successInfo:'',
      rating:0, // 难度
      hint: '',//密码提示
      count: 0, //已尝试的次数
      username: '',
      password: '',
      showPassword: false,
      nameErrorMessages: [],
      pwErrorMessages:[],
      users:_users,
      user: null
    }
  },
  computed:{
    message(){
      if(this.pwErrorMessages && JSON.stringify(this.pwErrorMessages)!='[]'){
        return this.pwErrorMessages
      }
      return this.hint
    }
  },
  components: {
    HelloWorld
  },
  methods: {
    async login(){
      let valid = this.$refs.form.validate()
      if(!valid) return //表单不正确
      if(!this.password){
        this.pwErrorMessages = '请输入密码'
        return
      }
      this.loading = true
      let user = this.users.find(user=>user.username==this.username)
      if(!user){
        this.nameErrorMessages=['用户不存在']
        this.loading = false
        return
      }
      await wait(Math.random()/2+0.3)
      if(this.password === user.password){
        this.loading= false
        this.showSuccessDialog(user.type)
      }else{
        this.pwErrorMessages='密码错误'
        await wait(Math.random()/2+1)
        this.loading = false
      }
    },
    reset:function(){
      // this.$refs.form.resetValidation()
      this.nameErrorMessages=[]
      this.pwErrorMessages=[]
      this.hint=""
      this.showHint()
    },
    getHint(array){
      let hint = array[this.count % array.length]
      this.count++
      return hint
    },
    showHint: debounce(function(){
      let user = this.users.find(user=>user.username==this.username)
      if(user && (user.password !== this.password)){
        console.log(user.type)
        let ta = ['她', '他'][user.sex]
        switch (user.type) {
          case 0:
            this.hint = this.getHint([
              '先从最简单的密码试试？',
              '有的人的想法可能没你想的那么复杂',
              `${ta}设置的大概都不算是一个密码吧。`,
              '2019年最差的3个密码：“12345” “123456” “123456789”'
            ])
            break;
          case 1:
            this.hint = this.getHint([`试试${ta}的生日？`,'很多人喜欢把年月日转换成6个数字。'])
            break;
          case 2:
            this.hint = this.getHint([
              `很多人喜欢往密码里面加名字拼音。`,
              `手机号+拼音，或者生日+拼音，是很常见的密码哟`
            ])
            break;
          case 3:
            let link = `<a target="_blank" href="${this.$router.resolve({name:'Markdown', params: { filename: '1'}}).href}">密码字典</a>`
            this.hint = this.getHint([
              `多数用户习惯不同网站都使用同一账号密码。`,
              `不同网站都使用一样密码，只要一个网站泄露了密码……`,
              `不久其他网站发生了密码泄露事件，这里是${link}`,
              `或许你可以试试这个${link}`
            ])
            break
          default:
            this.hint = '未知用户类型'
        }

      }
    }, 1000),
    generateAvatar(seed){
      let svg = new Blob([avatars.create(seed)], {type : 'image/svg+xml'})
      return URL.createObjectURL(svg)
    },
    showUserInfo(user){
      this.count=0
      this.user = user
      this.userInfoDialog = true
    },
    async showSuccessDialog(type){
      let ratingMap = [1,1,2,2,2] //评分对应表。
      let res = await axios.get(`/info/${type}.md`)
      this.successInfo = marked(res.data)
      this.rating = ratingMap[type]
      this.successDialog = true
    },
    colorHash(str){
      return colorHash.hex(str)
    }
  }
}
</script>
