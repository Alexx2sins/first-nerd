// server shop!
const discord = require('discord.js')

function getArgsPastIndex(index, array) {
    let x;
    let args = []
    for (x in array) {
        if (x >= index) {
            args.push(array[x])
        }
    }
  return args
}

function convertArray(json) {
    let array = []
    for (var i in json) {
        array.push(json[i])
    }
    return array
}

function shopToEmbed(shop, channel, client) {
    let items = shop.items
    let settings = shop.settings
    let embed = new discord.RichEmbed()
    let itemsArray = convertArray(items)
    if (itemsArray.length > 0) {
        
        embed.setTitle(settings.name)
        embed.setDescription(settings.description)
        for (var x in items) {
            let item = items[x]
            let price = item.price
            let desc = item.description
            embed.addField(x, `**Cost: ${price} coins**\n${desc}`)
        }
        embed.setThumbnail(settings.icon)
        embed.setFooter("jesse has the ultra fats", client.user.avatarURL)
        embed.setColor(process.env.green)
        embed.setTimestamp()
        channel.send({embed})
    } else {
        channel.send("Doesn't look like anything is up for sale!")
    }
}

function addRoleToMember(member, roleID, channel, client) {
    if (client.checkPerm(channel.guild.members.get(client.id), "MANAGE_ROLES")) {    
        if (client.roles.get(roleID)) {
            channel.send("It seems you have already purchased this role!")
            return false
        } else {
            member.addRole(roleID)
            .then(r =>  {
                channel.send("Role successfully purchased!")
                return true
            })
            .catch(error => {
                channel.send("There was an error adding your role!")
                return false
            })
           
        }
    } else {
        channel.send("I don't have the `Manage Roles` permission! Please check and try this again.")
        return false
    }
}



exports.run = (client, message, args, level) => {
    let guild = message.guild
    let guildKey = guild.id + '-SHOPTEST'
    let playerCoins = message.author.id + '-coins'
    let def = {
        'items': {
            'holder' : {
                price: 0,
                description: 'like a coffee holder, but with no coffee. what does it hold?'
            }
        },
        'settings' : {
            name: guild.name + "'s Shop",
            description: 'a place where you buy thingies for your shmingies',
            icon : 'https://cdn.discordapp.com/attachments/414573970374000640/493501939816988673/vanessa_shop_icon.png'
        }
    }       
    let acceptableTypes = {
        "Role" : true,
        "None" : true,
        "Item" : true
    }
    
    client.redisClient.get(guildKey, function(err, response) {
        if (response) {
            let shopData = JSON.parse(response)
            let action = args[0]
            if (!action) {
                shopToEmbed(shopData, message.channel, client)
                return
            }
            if (action == 'reset') {
                if (level >= 4) {
                    client.redisClient.set(guildKey, JSON.stringify(def))
                    message.channel.send("Shop successfully reset!")
                }
                return
            }
            
            
            // shop configuration
            
            if (action == 'seticon') {
                if (level >= 4) {
                    let pictures = message.attachments.array()
                    if (pictures.length == 0) {
                        return message.channel.send("Please upload an icon to the message!")
                    } else {
                        let picture = pictures[0]
                        shopData.settings.icon = picture.url
                        client.redisClient.set(guildKey, JSON.stringify(shopData), function(err, response) {
                            message.channel.send("Shop icon was successfully updated!")
                        })
                    }
                }
            }
            if (action == 'setdesc') { 
                 if (level >= 4) {
                     let desc = getArgsPastIndex(1, args)
                     desc = desc.join(" ")
                     if (desc.length == 0) {
                         return message.channel.send("Please send a description for your shop!")
                     } else {
                         shopData.settings.description = desc
                         client.redisClient.set(guildKey, JSON.stringify(shopData), function(err, response) {
                            message.channel.send("Shop description was successfully updated!")
                         })
                     }
                 }
            }
            if (action == 'setname') { 
                 if (level >= 4) {
                     let name = getArgsPastIndex(1, args)
                     name = name.join(" ")
                     if (name.length == 0) {
                         shopData.settings.name = guild.name + "'s Shop"
                         client.redisClient.set(guildKey, JSON.stringify(shopData), function(err, response) {
                            message.channel.send("Shop name was set to the default naming.")
                         })
                     } else {
                         shopData.settings.name = name
                         client.redisClient.set(guildKey, JSON.stringify(shopData), function(err, response) {
                            message.channel.send("Shop name was successfully updated!")
                         })
                     }
                 }
            }
        } else {            
            client.redisClient.set(guildKey, JSON.stringify(def), function(err, response) {              
                message.channel.send("Hold on, I've just set the basic settings for your server shop!")                
            })
        }
    })
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["shop"],
    permLevel: "User"
};

exports.help = {
    name: "store",
    category: "Development",
    description: "This command is under development!",
    usage: "store [action, ..name]"
};