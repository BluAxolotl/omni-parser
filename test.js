const { print, ConsoleCommand } = require("console-to-server")

const { SoundcloudSong, BotbSong, TwitterSong, YouTubeSong } = require('./index.js')
const OmniUtils = require('./utils.js')

const Discord = require('discord.js');
const client = new Discord.Client();

const VOICE_CHANNEL = "731021299295584266"
const CURRENT_LINK = "https://soundcloud.com/plrusek-chan/glass-ost-ronaldos-march"

new ConsoleCommand("load", "Loads up a song", ["song_link"], function (args) {
	print(args[0])
	let song = OmniUtils.link_parse(args[0])
	if (song != null) {
		if (song.constructed) { print(song) }
		song.event.on('constructed', function() {
			print(song)
		})
	} else {
		print("INVALID LINK")
	}
})

// let song = new SoundcloudSong("https://soundcloud.com/plrusek-chan/glass-ost-ronaldos-march")

// song.event.on('constructed', function() {
// 	print(song)
// })

// function play(song, channel_id) {

// }

// // client.on('message', (mess))

// client.on('ready', async () => {
// 	let i = client.channels.cache.get(VOICE_CHANNEL)
// 	let c = await i.join()
// 	let d
// 	let song = new SoundcloudSong("https://www.youtube.com/watch?v=v6XJPKanenM")
// 	song.getSource().then(stream => {
// 		d = c.play(stream)
// 	})
// })

// client.login("NzA1MzQ3NjcwMDU0NjY2MjYw.XqqYNQ.6mF5-XSEUb3AaoiKK8JUgYAGpiI")