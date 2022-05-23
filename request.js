const {print, print_debug} = require('console-to-server')

const https = require('https')

const request = {
  get: function (url) {
    print(url) 

    const options = {
      method: 'GET'
    }

    const req = https.request(url, options, res => {
      
      let body = ''
      res.setEncoding('utf8')

      res.on('data', d => {
        body += d
      })

      res.on('end', () => {
        let obj = JSON.parse(body)
        print(obj)
        return obj
      })
    })

    req.on('error', error => {
      print_debug(error)
    })

    req.end()
  }
}

module.exports = request