
new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
      api: 'https://pixabay.com/api/?key=8684338-5ff3aaf5d8bea38de8c394feb',
      images: null,
      expiryTime: 2, //Time in hours
      sText: '',
      snackBar: false,
      snackBarText: '',
      isLoading: false,
      axiosInterceptor: null,
      dialog: false,
      dialogImg: ''
    },
    mounted() {
      this.enableInterceptor()
      this.getImages()
    },
    methods:{
    clearLocal: function(){
      // let saved = localStorage.getItem('saved')
      // if (saved && (new Date().getTime() - saved > this.hours * 60 * 60 * 1000)) {
      //   localStorage.clear()
      // }
      if(localStorage.getItem('images')){
        localStorage.clear()
      }
    },
    getImages: function(){
      if(localStorage.images){
        this.images = JSON.parse(localStorage.images)
      }
      else{
        axios.get(this.api)
        .then(response => {
          this.images = response.data.hits
          Vue.set(this.images)
          localStorage.images = JSON.stringify(this.images)
          localStorage.setItem('saved', new Date().getTime())
        })
        .catch(error => (console.log(error)))
      }
    },
    makeFav: function(i){
      Vue.set(this.images, i, { ...this.images[i], liked: !this.images[i].liked })
    },
    forceFileDownload(response){
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      var rand = Math.floor(Math.random()*999)
      link.setAttribute('download', 'wallpep'+rand+'.png') //or any other extension
      document.body.appendChild(link)
      link.click()
    },
    downloadWithAxios(link){
      axios({
        method: 'get',
        url: link,
        responseType: 'arraybuffer'
      })
      .then(response => {
        
        this.forceFileDownload(response)
        
      })
      .catch(() => console.log('error occured'))
    },
    searchImage: function(e){
      this.sText = e.target.value

      axios.get(this.api+'&q='+this.sText)
      .then(response=>{
        const vm = this
        if(response.data.total <= 0){
          vm.snackBarText = "Image not Found for '"+ vm.sText +"'"
          vm.snackBar = true
        }else{
          this.images = response.data.hits
          const images = {
            sText: vm.sText,
            images: this.images
          }
          localStorage.setItem('searchHistory',JSON.stringify(images))
        }  
      })
      .catch(error=>{
        console.log(error)
      })
    },
    enableInterceptor() {
      this.axiosInterceptor = window.axios.interceptors.request.use((config) => {
          this.isLoading = true
          return config
      }, (error) => {
          this.isLoading = false  
          return Promise.reject(error)
      })
      
      window.axios.interceptors.response.use((response) => {
          this.isLoading = false    
          return response
      }, function(error) {
          this.isLoading = false
          return Promise.reject(error)
      })
    },
      
    disableInterceptor() {
        window.axios.interceptors.request.eject(this.axiosInterceptor)
    },

    viewImg(url){
      this.dialog = true
      this.dialogImg = url
    }
     
    },
    watch:{
      
    },
})