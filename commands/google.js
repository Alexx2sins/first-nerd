// clear messages
let badLinks = [
  "porn",
  "hentai",
  "deathaddict",
  "gay",
  "xvide",
  "grabify",
  "redtu",
  "liveleak",
  "brazz",
  "bangbr",
  "wetting",
  "nude",
  "naked",
  "sex",
  "r34",
  "rule34",
  "e621",
  "gore",
  "milf",
  "vagina",
  "pussy",
  "slut",
  "penis",
  "dick",
  "ass",
  "gore",
  "gay p",
  "prn",
  "d1ck",
  "p0rn",
  "pen15"
]


exports.run = (client, message, args, level) => {
    var google = require('google')
    var canPost = true

    let links = []
    let search = args.join(" ")
    if (search === undefined) {
        message.channel.send("Please send something to search!")
        return;
    }
    search = client.removeAccents(search)
    google(search, async (err, response) => {
        let res = response
        let linkObj = res.links[0]
        let link = linkObj.href
        let title = linkObj.title
        let desc = linkObj.description
        
        if (!link) {
            message.channel.send("There were no search results.")
            return
        } else {

            for (x in badLinks) {
              if (link.toLowerCase().match(badLinks[x])) {
                canPost = false
                break;
              }
              if (title.toLowerCase().match(badLinks[x])) {
                canPost = false
                break;
              }
              if (desc.toLowerCase().match(badLinks[x])) {
                canPost = false
                break;
              }
            }
            if (canPost) {
              message.channel.send(`${title}\n${link}\n\n${desc}`)
            } else {
              message.channel.send("Sorry! The content on that page would be deemed inappropiate.")
            }

        }
    })

}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["search"],
    permLevel: "User"
};

exports.help = {
    name: "google",
    category: "Fun",
    description: "Googles stuff. You know?",
    usage: "google [...search terms]"
};
