const print = console.log

var {mediaUrlParser} = require('media-url-parser')
const twitterGetUrl = require("twitter-url-direct")

const SoundcloudSong = require('./song_types/soundcloud_song.js')
const YouTubeSong = require('./song_types/youtube_song.js')
const BandcampSong = require('./song_types/bandcamp_song.js')
const BotbSong = require('./song_types/botb_song.js')
const TwitterSong = require('./song_types/twitter_song.js')
const RemoteFileSong = require('./song_types/remote_file_song.js')

class ParseError {
	constructor(string,code) {
		this.string = string
		this.code = code
	}

	throw_err() {
		let stack = new Error().stack
		return new Error(`${this.string}:${this.code}\n\n${stack}`)
	}
}

function link_parse(link) {
	if (link == null) { return new ParseError("INVALID LINK", -1) }
	let args = link.split("/")
	try { var parsed = mediaUrlParser(link) } catch(err) { parsed = null }
	if (link.startsWith('https://soundcloud.com/') || link.startsWith('https://soundcloud.app.goo.gl/')) { // SOUNDCLOUD
		link = link.split("?")[0]
		if (args[3] == "you") {
			return new ParseError("SOUNDCLOUD 'YOU' REFERER", -2)
		} else if (args[4] == "sets") {
			let tool = new SoundcloudSong(-1)
			tool.loadMultiple(link)
			return tool
		} else {
			return new SoundcloudSong(link)
		}
	} else if (link.startsWith('https://battleofthebits.org/arena/Entry/')) { // BATTLEOFTHEBITS https://battleofthebits.org/arena/Entry/{name}/{id}/
		return new BotbSong(link)
	} else if (link.startsWith('https://battleofthebits.org/arena/Battle/')) {
		let tool = new BotbSong(-1)
		tool.loadMultiple(link)
		return tool
	} else if (link.startsWith('https://www.youtube.com/playlist')) {
		let tool = new YouTubeSong(-1)
		tool.loadMultiple(link)
		return tool
	} else if (link.startsWith('https://www.youtube.com/watch?v=') || link.startsWith('https://youtu.be/')) {
		return new YouTubeSong(link)
	} else if ( link.startsWith("https://twitter.com/") || link.startsWith("https://fxtwitter.com/")) {
		args[5] = args[5].split('?')[0]
		link = link.replace("https://fxtwitter.com/", "https://twitter.com/")
		print("https://twitter.com/i/status/"+args[5])
		if (args[4] == "timelines") {
			let tool = new TwitterSong(-1)
			tool.loadMultiple(link)
			return tool
		} else {
			if (true) {
				return new TwitterSong("https://twitter.com/i/status/"+args[5])
			} else {
				return new ParseError("INVALID LINK", -1)
			}
		}
	} else if (args[2].endsWith(".bandcamp.com")) {
		if (args[3] == "track") {
			return new BandcampSong(link)
		} else if (args[3] == "album") {
			let tool = new BandcampSong(-1)
			tool.loadMultiple(link)
			return tool
		}
	} else if (parsed != null && parsed.provider == 'file' && parsed.id != null) {
		return new RemoteFileSong(link)
	} else {
		return new ParseError("INVALID LINK", -1)
	}
}

module.exports = {
	link_parse: link_parse
}