const SoundcloudSong = require('./song_types/soundcloud_song.js')
const YouTubeSong = require('./song_types/youtube_song.js')
const BotbSong = require('./song_types/botb_song.js')
const TwitterSong = require('./song_types/twitter_song.js')
const OmniSong = require('./omni_song.js')
const OmniUtils = require('./utils.js')

module.exports = {
	SoundcloudSong: SoundcloudSong, 
	YouTubeSong: YouTubeSong, 
	BotbSong: BotbSong,
	TwitterSong: TwitterSong,
	OmniUtils: OmniUtils
}