const gm = require('gm').subClass({imageMagick: true})
const SpacebroClient = require('spacebro-client').SpacebroClient
var standardSettings = require('standard-settings')
const download = require('download')
const express = require('express')
const path = require('path')
const mkdirp = require('mkdirp')
var settings = standardSettings.getSettings()

var spacebroClient = new SpacebroClient()
console.log(settings.folder.output)
mkdirp(settings.folder.output)
mkdirp(settings.folder.tmp)

spacebroClient.on(settings.service.spacebro.client.in.inMedia.eventName, media => {
  download(media.url, settings.folder.tmp).then(() => {
    let image = path.join(settings.folder.tmp, path.basename(media.url))
    let outImage = path.join(settings.folder.output, path.basename(media.url))
    let outMedia = {
      url: `http://${settings.server.host}:${settings.server.port}/${path.basename(media.url)}`
    }
    gm(image)
    .blur(7, 3)
    .write(outImage, function (err) {
      if (!err) {
        spacebroClient.emit(settings.service.spacebro.client.out.outMedia.eventName, outMedia)
        console.log('emit ' + JSON.stringify(outMedia, null, 2))
      } else console.log(err)
    })
  })
})

var app = express()
app.use(express.static(settings.folder.output))
app.listen(process.env.PORT || settings.server.port)
