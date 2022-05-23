const OmniSong = require('../omni_song.js')
const {print, print_debug, print_error} = require('console-to-server')
const bcfetch = require('bandcamp-fetch')
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');
var request = require('sync-request')
var fetch = require('node-fetch')
const Duplex = require('stream').Duplex;  // core NodeJS API
function bufferToStream(buffer) {  
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

Array.prototype.remove = function (index) {
    if (index > -1 && index < this.length-1) {
    	return this.splice(index, 1)
    }
}

class BandcampSong extends OmniSong {
	constructor(url, obj = null) {
		super(true, true, true)
		if (url == -1) {
			if ( obj != null ) {
				this.url = obj.url
				const promise = new Promise((res, rej) => {
					ffprobe(obj.streamUrl, { path: ffprobeStatic.path }, function (err, info) {
						if (err) return print_error(err);
						res(Number(info.streams[0].duration)*1000)
					})
				})
				promise.then(time => {
					this.consruct_song(
						obj.name,
						obj.artist.name,
						obj.imageUrl,
						obj.streamUrl,
						new Date,
						obj.artist.description,
						"BC",
						time
					)
				})
			} else {
				this.util = true
			}
		} else {
			this.url = url
			// this.id = link_bits[5]
			this.util = false
			this.getTrackObject(url)
		}
	}

	getSource() {
		return new Promise(async (res, rej) => {
			fetch(this.source,  {
				method: "GET"
			}).then(response => {
				res(response.body)
			})
		})
	}

	async loadMultiple(url) {
		var band_this_obj = this
		bcfetch.getAlbumInfo(url).then(album => {
			let album_length = album.numTracks
			let album_name = album.name
			album.tracks.forEach((track, index) => {
				track.artist = album.artist
				let songObj = new BandcampSong(-1, track)
				band_this_obj.event.emit('song', {index: index, song: songObj}, album_length, album_name)
				if (index+1 == album_length) {
					band_this_obj.event.emit('constructed')
				}
			})
		})
	}

	async getTrackObject(base_url) {
		var band_this_obj = this
		bcfetch.getTrackInfo(base_url).then(async track => {
			const promise = new Promise((res, rej) => {
				ffprobe(track.streamUrl, { path: ffprobeStatic.path }, function (err, info) {
					if (err) return print_error(err);
					res(Number(info.streams[0].duration)*1000)
				})
			})
			let time = await promise
			band_this_obj.consruct_song(
				track.name,
				track.artist.name,
				track.imageUrl,
				track.streamUrl,
				new Date,
				track.artist.description,
				"BC",
				Math.floor(time)
			)
		})
	}
}

module.exports = BandcampSong