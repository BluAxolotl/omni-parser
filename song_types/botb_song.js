const OmniSong = require('../omni_song.js')
const print = console.log
var request = require('sync-request')
var fetch = require('node-fetch')
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');
const { Readable } = require('stream')
// const Duplex = require('stream').Duplex;  // core NodeJS API
function bufferToStream(buffer) {  
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

class BotbSong extends OmniSong {
	constructor(url) {
		super(true, true, true)
		if (url == -1) {
			this.util = true
		} else {
			this.util = false
			this.getTrackObject(url)
			this.url = url
		}
	}

	async loadMultiple(url) {
		let battle_id = url.split("/")[5]
		let battle_obj = request('GET', `https://battleofthebits.org/api/v1/entry/list/0/250?filters=battle_id~${battle_id}`, {
			headers: {
			  'user-agent': 'example-user-agent'
			},
		})
		battle_obj = JSON.parse(battle_obj.getBody('utf8'))
		battle_obj.forEach((i, n, a) => {
			var b_song = new BotbSong(i.profile_url)
			b_song.event.on('constructed', () => { this.event.emit('song', {index: n, song: b_song}, a.length, "idk, lawl") })
		})
		this.event.emit('constructed')
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
		let song_id = base_url.split("/")[6]
		let song_obj = request('GET', `https://battleofthebits.org/api/v1/entry/load/${song_id}/`, {
			headers: {
			  'user-agent': 'example-user-agent'
			},
		})
		song_obj = JSON.parse(song_obj.getBody('utf8'))
		this.source = song_obj.preview_url
		let author_string = []
		song_obj.authors.forEach(i => {
			author_string.push(i.name)
		})
		const promise = new Promise((res, rej) => {
			ffprobe(this.source, { path: ffprobeStatic.path }, function (err, info) {
				if (err) return print_error(err);
				res(Number(info.streams[0].duration)*1000)
			})
		})
		let time = await promise
		this.consruct_song(
			song_obj.title,
			author_string.join(", "),
			"https://battleofthebits.org"+(song_obj.thumbnail_url != null ? song_obj.thumbnail_url : song_obj.botbr.avatar_url), 	
			song_obj.preview_url,
			song_obj.datetime,
			`An entry for the '${song_obj.battle.title}' battle`,
			"BT",
			Math.floor(time)
		)
	}
}

module.exports = BotbSong