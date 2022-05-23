var EventEmitter = require('events')

const {print, print_debug, print_error} = require('console-to-server')

const SongType = require('./song_types.js')

class OmniSong {
	constructor(can_like, can_playlist, can_repost) {
		this.event = new EventEmitter()
		this.constructed = false
		this.can_repost = can_repost
		this.can_like = can_like
		this.can_playlist = can_playlist
		this.valid = true
	}

	invalidate() {
		this.event.emit('invalidated')
		this.valid = false
	}

	consruct_song(title, author, icon, source, published, desc, type, length) {
		try {
			this.title = title
			this.author = author
			this.icon = icon
			this.source = source
			this.published = published
			this.type = SongType[type]
			this.desc = desc
			this.length = length

			this.fancy_title = `${author} - ${title}`

			this.constructed = true
			this.event.emit('constructed')
		} catch(err) {
			print_error(err)
		}
	}
}

module.exports = OmniSong