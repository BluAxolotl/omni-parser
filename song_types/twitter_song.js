const OmniSong = require('../omni_song.js')
const {print, print_debug, print_error} = require('console-to-server')
const twitterGetUrl = require("twitter-url-direct")
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

var Twitter = require('twitter')
var TwitClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

Array.prototype.remove = function (index) {
    if (index > -1 && index < this.length-1) {
    	return this.splice(index, 1)
    }
}

class TwitterSong extends OmniSong {
	constructor(url, obj = null) {
		super(true, true, true)
		if (url == -1) {
			if ( obj != null ) {
				this.url = "https://twitter.com/i/status/" + obj.id_str
			  var twit_obj = {
			  	title: ((obj.full_text.slice(0, 35) + "...").replace(/(\r\n|\n|\r)/gm, "")),
			  	author: obj.user.screen_name,
			  	thumbnail: obj.entities.media[0].media_url,
			  	description: obj.text
			  }
			  var source = obj.extended_entities.media[0].video_info.variants.filter(i => i.content_type == "video/mp4").sort((a, b) => b.bitrate - a.bitrate)[0].url
				this.consruct_song(
					twit_obj.title,
					twit_obj.author,
					twit_obj.thumbnail,
					source,
					new Date,
					twit_obj.description,
					"TW",
					obj.extended_entities.media[0].video_info.duration_millis
				)
			} else {
				this.util = true
			}
		} else {
			this.url = url
			var link_bits = url.split("/")
			this.id = link_bits[5]
			this.util = false
			this.getTrackObject(url)
		}
	}

	getSource() {
		return new Promise(async (res, rej) => {
			let link = this.url.replace("https://fxtwitter.com/i/status/", "https://twitter.com/i/status/")
			let url_obj = await twitterGetUrl(link)
			var downloads = url_obj.download
			// "https:", "", "video.twing.com", "ext_tw_video", tweet_id, "pu", "vid", THE_SAUCE, irrelevant...
			// "https:", "", "video.twing.com", "amplify_video", tweet_id, "vid", THE_SAUCE, irrelevant...
			if (downloads[0].url.split("/").includes("amplify_video")) {
				var hd_url = downloads.sort((a, b) => {
					let a_width = Number(a.url.split("/")[6].split("x")[0])
					let b_width = Number(b.url.split("/")[6].split("x")[0])

					return b_width - a_width
				})[0].url
			} else {
				var hd_url = downloads.sort((a, b) => Number(b.width) - Number(a.width))[0].url
			}
			print(hd_url)
			fetch(hd_url,  {
				method: "GET"
			}).then(response => {
				res(response.body)
			})
		})
	}

	async loadMultiple(url) {
		var link_bits = url.split("/")
		var twit_class_obj = this
		var coll_id = "custom-"+link_bits[5]
		TwitClient.get('collections/entries', {id: coll_id, count: 200, min_position: 0, tweet_mode: "extended", trim_user: false}, function(error, object, response) {
			if(error) print(error);
			var tweets = Object.values(object.objects.tweets)
			var users = Object.values(object.objects.users)
			var tweets_length = tweets.length
			tweets.forEach((i, n, a) => {
				if (i.extended_entities != null && i.extended_entities.media != null) {
					i.user = users.find(user => user.id_str == i.user.id_str)
					var t_song = new TwitterSong(-1, i)
					let t_index = Number(object.response.timeline.find(pos_info => {
												return pos_info.tweet.id == i.id_str
											}).tweet.sort_index)
					print(t_index)
					twit_class_obj.event.emit('song', {index: -t_index, song: t_song}, tweets_length, object.objects.timelines[coll_id].name)
				} else {
					tweets_length--
				}
			})
			twit_class_obj.event.emit('constructed')
		})
	}

	async getTrackObject(base_url) {
		var twit_class_obj = this
		var twit_obj = {
			title: "A Tweet",
			author: "A Twitter User",
			thumbnail: null,
			description: "A Tweet by a Twitter User"
		}
		TwitClient.get('statuses/show', {id: this.id, tweet_mode: "extended"}, function(error, tweet, response) {
		  if(error) {print(error);} else {
			  if (tweet.entities == null || tweet.entities.media == null) {
			  	twit_class_obj.invalidate()
			  } else {
				  twit_obj = {
				  	title: (tweet.full_text.slice(0, 35) + "..."),
				  	author: tweet.user.screen_name,
				  	thumbnail: tweet.entities.media[0].media_url,
				  	description: tweet.text
				  }
					twit_class_obj.consruct_song(
						(twit_obj.title.replace(/(\r\n|\n|\r)/gm, "")),
						twit_obj.author,
						twit_obj.thumbnail,
						null,
						new Date,
						twit_obj.description,
						"TW",
						tweet.extended_entities.media[0].video_info.duration_millis
					)
			  }
		  }
		})
	}
}

module.exports = TwitterSong