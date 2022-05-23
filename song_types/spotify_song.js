const OmniSong = require('../omni_song.js')
const {print, print_debug} = require('console-to-server')
const spotify = require('spnk-core').spotify

class SpotifySong extends OmniSong {
	constructor(url) {
		super(true, true, true)
		this.getTrackObject(url)
		this.url = url
	}

	getSource() {
		return new Promise(async (res, rej) => {
			print(this.url)
			spotify(this.url).then(file => {
				res(file)
			})
		})
	}

	async getTrackObject(base_url) {
		let song_obj = {
			title: "Spotify Song",
			author: "A Spotify Artist",
			description: "A Song by a Spotify Artist"
		}
		this.consruct_song(
			song_obj.title,
			song_obj.author,
			null,
			null,
			new Date().toString(),
			song_obj.description,
			"SP",
			60000
		)
	}
}

module.exports = SpotifySong