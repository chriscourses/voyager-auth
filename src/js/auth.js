import Vue from 'vue/dist/vue.js'
import VeeValidate from 'vee-validate'
Vue.use(VeeValidate)

const app = new Vue({
    el: '#auth-form',
    methods: {
        validateBeforeSubmit() {
            this.$validator
                .validateAll()
                .then(response => {
                    if (response === true) this.$refs.form.submit()
                })
                .catch(function(e) {
                    console.log(e)
                })
        }
    }
})
