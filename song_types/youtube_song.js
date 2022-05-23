const OmniSong = require('../omni_song.js')
const {print, print_debug} = require('console-to-server')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')

class YouTubeSong extends OmniSong {
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

	getSource() {
		return new Promise(async (res, rej) => {
			res(ytdl(this.url, {filter: "audioonly", quality: "highestaudio"}))
		})
	}

	async loadMultiple(url) {
		print(url)
		try {
			let playlist_obj = await ytpl(url)
			playlist_obj.items.forEach((i, n, a) => {
				let song = new YouTubeSong(i.shortUrl)
				song.event.on('constructed', () => { this.event.emit('song', {index: n, song: song}, playlist_obj.items.length, playlist_obj.title) })
			})
		} catch (err) {
			print(err)
			return
		} finally {
			this.event.emit('constructed')
		}
	}

	async getTrackObject(base_url) {
		let song_obj = await ytdl.getBasicInfo(base_url)
		this.consruct_song(
			song_obj.videoDetails.title,
			song_obj.videoDetails.author.name,
			song_obj.videoDetails.thumbnails[0].url,
			null,
			new Date().toString(),
			song_obj.videoDetails.description,
			"YT",
			(song_obj.videoDetails.lengthSeconds*1000)
		)
	}
}

module.exports = YouTubeSong