module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  publicPath: process.env.NODE_ENV === 'production'
    ? '/guess-the-password/'
    : '/',
  pwa:{
    name: '猜密码',
    themeColor: '#EC407A',
    msTileColor: '#EC407A'
  }
}
