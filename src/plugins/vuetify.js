import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'
Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        primary: colors.pink.lighten2, // #E53935
        secondary: colors.pink.lighten4, // #FFCDD2
        accent: colors.pink.accent1, // #3F51B5
      },
    },
  },
});
