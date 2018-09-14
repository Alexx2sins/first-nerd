// ban user

exports.run = (client, message, args, level) => {
   var discord = require("discord.js")
   var allowedUsers = client.redisClient.get("Roadmap Allowed")
   var prefix = client.config.prefix
   
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
   
   function spaceOut(str) {
      let matching = '-'
      let final = str
      while (final.match(matching)) {
         final.replace(matching, " ")
      }
      return final
   }
      
   client.redisClient.get("Roadmap", function(err, roadmapData) {
      if (roadmapData) {
         var data = JSON.parse(roadmapData)
         var scope = args[0]
         var command = args[1]
         if (command && scope == 'config') {
            if (level == 10 || allowedUsers[message.author.id]) {
               let cmdArgs = getArgsPastIndex(1, args)
               if (command == "help") {
                   const embed = discord.RichEmbed()
                  .setTitle("Command help")
                  .addField("addtopic", `Add a new topic / scope!\nUsage: ${prefix}roadmap config addtopic [topic-name]\n!! NOTE: Spaces are marked with a **-** between letters.`)
                  .addField("deltopic", `Deletes a topic / scope.\nUsage: ${prefix}roadpmap config deletetopic [topic-name]\n!! NOTE: Spaces are marked with a **-** between letters.`)
                  .addField("addplan", `Adds a plan to a topic.\nUsage: ${prefix}roadmpaddplan [topic-name] [plan]\!! NOTE: Spaces are marked with a **-** between letters. **This is not required for adding plans.**`)
                  .addField("delplan", `Deletes a plan from a topic.\nUsage: ${prefix}delplan [topic-name] [plan number (1, 2, etc)]\!! NOTE: Spaces are marked with a **-** between letters. **This is not required for adding plans.**`)
                  .addField("help", "Displays help!")
                  .setColor(6579455)
                  message.channel.send({embed})
               }
               if (command == "addtopic") {
                  let modified = data
                  let name = cmdArgs[1]
                  name = spaceOut(name)
                  if (modified[name]) {
                     message.channel.send("That topic exists already!")
                  } else {
                     modified[name] = []
                     client.redisClient.set("Roadmap", modified)
                     message.channel.send("Created topic **" + name + ".** ✅")
                  }
               }
               if (command == "deltopic") {
                  let modified = data
                  let name = cmdArgs[1]
                  name = spaceOut(name)
                  if (!modified[name]) {
                     message.channel.send("That topic does not exist!")
                  } else {
                     modified[name] = null
                     client.redisClient.set("Roadmap", JSON.stringify(modified))
                     message.channel.send("Deleted topic **" + name + ".** ✅")
                  }
               }
               if (command == "addplan") {
                  let modified = data
                  let name = cmdArgs[1]
                  name = spaceOut(name)
                  let plan = getArgsPastIndex(2, cmdArgs)
                  if (!modified[name]) {
                     message.channel.send("Topic does not exist!")
                  } else {
                     modified[name].push(plan)
                     client.redisClient.set("Roadmap", JSON.stringify(modified))
                     message.channel.send("Added plan to topic **" + name + ".** ✅")
                  }
               }
               if (command == "delplan") {
                  let modified = data
                  let name = cmdArgs[1]
                  name = spaceOut(name)
                  let num = cmdArgs[2]
                  if (!modified[name]) {
                     message.channel.send("Topic does not exist!")
                  } else {
                     modified[name].splice(num, 1)
                     client.redisClient.set("Roadmap", JSON.stringify(modified))
                     message.channel.send(`Deleted plan **#${num}** from topic **${name}.** ✅`)
                  }
               }
            } else {
               message.channel.send("access denied!")
            }
         }
         if (scope && !command) {
               let plans = data[scope]
               if (plans) {                 
                  let str = ""
                  for (var i in plans) {
                     str = str + (`${i + 1} - ${plans[i]}`)
                  }
                  const embed = discord.RichEmbed()
                  .setTitle("Roadmap for **" + scope + "**")
                  if (str.length > 0) {
                     embed..addField("Plans", str)
                  } else {
                     embed.addField("Plans", "Nothing here yet...")
                  }
                  message.channel.send({embed})
               } else {
                  message.channel.send("No plans for this topic!")
               }
            }
           
         } else {                  
            message.channel.send("Please provide a scope / roadmap topic!")
            let scopes = [];
            let i;
            for (i in data) {
               scopes.push(`**${i}**`)
            }
            let str = scopes.join("\n")
            if (scopes.length > 0) {
                const discord.RichEmbed()
               .addField("Scopes and topics\n\n", str)
               .setColor(6579455)
               message.channel.send({embed}) 
            } else {
                message.channel.send("No topics have been added.") 
            }
         }        
      } else {
         message.channel.send("doesn't look like there's anything planned! at all....")
      }
    })
    
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [""],
    permLevel: "User"
};

exports.help = {
    name: "roadmap",
    category: "System",
    description: `Shows any planned updates.\nConfig topics using <prefix>roadmap config [params].\nUse <prefix>roadmap config help for help.`,
    usage: "roadmap"
};
