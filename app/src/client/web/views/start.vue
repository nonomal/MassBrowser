<template lang='pug'>
    #page-start
        .panel.panel-primary
            .panel-body.center
                h1.title MassBrowser
                .supported(v-if='supported')
                    h4 This guide will help you get started
                    button.bottom.btn.btn-info.btn-rounded.btn-lg(v-on:click='start') Lets Start
                .not-supported(v-if='!supported')
                    h4 Unfortunately, your browser is not supported.
                    h4 #[span.red Firefox] is currently the only supported browser


</template>

<script>
  import { getBrowser } from '../utils'
  import { SUPPORTED_BROWSERS } from '../config'

  export default {
    data () {
      return {
        browser: null,
        supported: true
      }
    },
    created () {
      this.browser = getBrowser()
      this.supported = SUPPORTED_BROWSERS.indexOf(this.browser) !== -1
    },
    methods: {
      start () {
        this.$router.push(`/${this.browser}`)
      }
    }
  }
</script>

<style lang='scss'>
    #page-start {
        .center {
            text-align: center;
        }
        .title {
            text-align: center;
        }
        .supported,.not-supported {
            margin-top: 50px;
            padding-bottom: 30px;
        }
        .btn {
            margin-top: 50px;
            width: 150px;
        }
        .red {
            color: #bb6666;
        }
    }
</style>
