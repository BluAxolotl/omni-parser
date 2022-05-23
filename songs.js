const {print, print_debug} = require('console-to-server')

const SoundcloudSong = require('./song_types/soundcloud_song.js')
const YouTubeSong = require('./song_types/youtube_song.js')
const BotbSong = require('./song_types/botb_song.js')
const TwitterSong = require('./song_types/twitter_song.js')

module.exports = {
	SoundcloudSong: SoundcloudSong,
	YouTubeSong: YouTubeSong,
	BotbSong: BotbSong,
	TwitterSong: TwitterSong,
	YouTubeSong: YouTubeSong
}