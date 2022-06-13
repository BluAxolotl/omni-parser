const OmniSong = require('../omni_song.js')
const {Writable} = require('stream')
const print = console.log
const scdl = require('soundcloud-downloader').default
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client()
const SC_CLIENT_ID = "c7qRtooYX5D1QXCM7DmD1J4E7v5YcxpR"

class SoundcloudSong extends OmniSong {
	constructor(url, obj = null) {
		super(true, true, true)
		if (url == -1) {
			if (obj != null) {
				this.url = obj.permalink_url
				this.consruct_song(
					obj.title,
					obj.user.username,
					obj.artwork_url,
					null,
					obj.created_at,
					obj.description,
					"SC",
					obj.full_duration
				)
			} else {
				this.util = true
			}
		} else {	
			this.util = false
			this.getTrackObject(url)
			this.url = url
		}
	}

	getSource() {
		return new Promise((res, rej) => {
			if (this.url != null) {
				client.getSongInfo(this.url).then(i => { res(i.downloadProgressive()) })
			} else {
				res("Song URL is undefined")
			}
		})
	}

	async loadMultiple(url) {
		try {	
			let playlist_obj = await scdl.getSetInfo(url)
			playlist_obj.tracks.forEach((i, n, a) => {
				let song = new SoundcloudSong(-1, i)
				this.event.emit('song', {index: n, song: song}, playlist_obj.tracks.length, playlist_obj.title)
			})
		} catch (err) {
			print("INVALID")
			print(err)
			if ((err.response && err.response.status) == 400) {
				this.invalidate()
				print("INVALID")
			}
		} finally {
			this.event.emit('constructed')
		}
	}

	async getTrackObject(base_url) {
		let song_obj = await client.getSongInfo(base_url)
		this.consruct_song(
			song_obj.title,
			song_obj.author.name,
			song_obj.thumbnail,
			null,
			song_obj.publishedAt.toString(),
			song_obj.description,
			"SC",
			song_obj.duration
		)
	}
}

// async function external_loadMultiple(url) {

// }

module.exports = SoundcloudSong