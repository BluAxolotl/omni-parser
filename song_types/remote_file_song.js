const OmniSong = require('../omni_song.js')
const print = console.log
var {mediaUrlParser} = require('media-url-parser')
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

class RemoteFileSong extends OmniSong {
	constructor(url) {
		super(true, true, true)
		this.getTrackObject(url)
		this.url = url
	}

	getSource() {
		return new Promise((res, rej) => {
			fetch(this.source,  {
				method: "GET"
			}).then(response => {
				res(response.body)
			})
		})
	}

	async getTrackObject(base_url) {
		let file_info = mediaUrlParser(base_url)
		let song_obj = {
			title: file_info.id
		}
		const promise = new Promise((res, rej) => {
			ffprobe(base_url, { path: ffprobeStatic.path }, function (err, info) {
				if (err) return print_error(err);
				res(Number(info.streams[0].duration)*1000)
			})
		})
		let time = await promise
		this.consruct_song(
			song_obj.title,
			"unknown",
			null,
			base_url,
			"unknown",
			base_url,
			"AF",
			Math.floor(time)
		)
	}
}

module.exports = RemoteFileSong