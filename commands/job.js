// workin
var workers = {}

const moment = require("moment");
require("moment-duration-format");

const discord = require('discord.js')

function random(array) {
    return array[Math.floor(Math.random() * array.length)] || array[0]
}

function getRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

exports.run = (client, message, args, level) => {
  let guild = message.guild
  let phrases = [
    "You swept the floors and got ",
    "You got ",
    "You made a successful game and got ",
    "You did some work and got ",
    "You helped someone find their cat and they rewarded you with ",
    "You sold your old junk and made ",
    "You wrote a song, and sold tons of copies for ",
    "You sold your business for "
  ]

  let timeoutKey = message.author.id + "-" + message.guild.id + '-timeout'
  let dataKey = message.author.id + "-" + message.guild.id + "-coins"

  let now = Date.now()
  client.redisClient.get(guild.id + '-SETTINGS', function(err, reply) {
    let settings = JSON.parse(reply)
    if (!settings) {
       settings = client.config.defaultSettings
    }

    let coinEarnMin = parseInt(settings.coinEarnMin) || client.config.defaultSettings.coinEarnMin || 20
    let coinEarnMax = parseInt(settings.coinEarnMax) || client.config.defaultSettings.coinEarnMax || 50
    let coinEarnCooldown = parseInt(settings.coinEarnCooldown) || client.config.defaultSettings.coinEarnCooldown || 5

    coinEarnCooldown = coinEarnCooldown * 1000
    if (!workers[timeoutKey]) {
      workers[timeoutKey] = now - (coinEarnCooldown * 2)
    }
    if (workers[timeoutKey]) {
      let time = workers[timeoutKey]
        if (now - time > coinEarnCooldown) {
          workers[timeoutKey] = now
          let phrase = random(phrases)
          let payout = getRand(coinEarnMin, coinEarnMax)
          let embed = new discord.RichEmbed()
          embed.setTitle("Job")
          embed.setDescription(phrase + payout + " coins.")
          embed.setColor(process.env.green)
	  if (payout >= Math.pow(2^40)) {
              message.channel.send("Could not payout; sum is too great!")
              return
          }
          client.redisClient.incrby(dataKey, payout, function(err, reply) {
            message.channel.send({embed})
		 
          client.updateGlobal({key: message.author.id, value: reply, guild: message.guild.id + "-globalcoins"}) 
          })
          
        } else {
          let timeElapsed = now - time
          let format = moment.duration(coinEarnCooldown - timeElapsed).format(" D [days], H [hours], m [minutes], s [seconds]");
          message.channel.send("You have to wait **" + format + "** until you can work!");
        }
    } else {

    }
  })
}

exports.conf = {
		enabled: true,
		guildOnly: true,
		aliases: ["work"],
		permLevel: "User"
};

exports.help = {
		name: "job",
		category: "Economy",
		description: "Put in some time and get some profit!",
		usage: "job"
};