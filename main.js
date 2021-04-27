const packageJson = require("./package.json");
require("dotenv").config();
const http = require("http");
const querystring = require("querystring");
const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
const ytdl = require("ytdl-core");
const schedule = require("node-schedule");
const rule = new schedule.RecurrenceRule();
rule.tz = "Asia/Tokyo";
client.login(process.env.DISCORD_BOT_TOKEN);
const chaplusUrl = "https://www.chaplus.jp/v1/chat?apikey=5f4290de659e5";
const googleTTS = require("google-tts-api");
const mainChannelID = "775700380163244077";

http
  .createServer(function(req, res) {
    if (req.method == "POST") {
      let data = "";
      req.on("data", function(chunk) {
        data += chunk;
      });
      req.on("end", function() {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        const dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        } else if (dataObject.type == "notice") {
          res.end();
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);

client.on("ready", () => {
  console.log("サーバーが起動しました");
  client.user.setPresence({ activity: { name: "あしたからがんばる" } });
});

//毎時０分に時報音を再生する
const job_0 = schedule.scheduleJob("59 * * * *", async function() {
  const connection = await client.channels.cache.get(mainChannelID).join();

  setTimeout(function() {
    connection.play(
      ytdl("https://www.youtube.com/watch?v=ZD-eWcKYRYU", {
        filter: "audioonly"
      }),
      { volume: 0.1 }
    );
    const Hour = new Date(
      Date.now() + (new Date().getTimezoneOffset() + 10 * 60) * 60 * 1000
    ).getHours();
    let url = googleTTS.getAudioUrl(Hour + "時です", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com"
    });
    if (
      Hour > -1 &&
      Hour < 7 &&
      client.guilds.cache.get("775700380163244073").members.guild.voiceStates.cache.get("483971493412470795").channelID === mainChannelID
    ) {
      url = googleTTS.getAudioUrl(
        Hour +
          "時です。ちゃさんがVCに接続しているのを確認しました。もう深夜ですよ",
        {
          lang: "ja-JP",
          slow: false,
          host: "https://translate.google.com"
        }
      );
    }
    setTimeout(function() {
      connection.play(url, { volume: 1.0 });
    }, 15000);
  }, 49000);
});

//botを常駐化
const job_2 = schedule.scheduleJob("1-58/2 * * * *", async function() {
  const connection = await client.channels.cache.get(mainChannelID).join();
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (
    newState.channelID === mainChannelID &&
    oldState.channelID !== mainChannelID
  ) {
    let Name = await client.users.cache.get(oldState.id).username;
    if (oldState.id === "715925807369027664") {
      Name = "れいか";
    }
    if (oldState.id === "229276445891887114") {
      Name = "けーしん";
    }
    if (oldState.id === "594745810164645899") {
      Name = "うざき";
    }
    const url = googleTTS.getAudioUrl(Name + "さんが入室しました", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com"
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 1.0 });
  } else if (
    newState.channelID !== mainChannelID &&
    oldState.channelID === mainChannelID
  ) {
    let Name = await client.users.cache.get(oldState.id).username;
    if (oldState.id === "715925807369027664") {
      Name = "れいか";
    }
    if (oldState.id === "229276445891887114") {
      Name = "けーしん";
    }
    if (oldState.id === "594745810164645899") {
      Name = "うざき";
    }
    const url = googleTTS.getAudioUrl(Name + "さんが退室しました", {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com"
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 1.0 });
  }
});

client.on("message", async msg => {
  //ユーザーの発言に対して10%の確率でランダムなリアクションを返す(休止中)
  /*const prob = Math.floor(Math.random() * 100);
  if (msg.content && prob < 10)
    {
      //massageがBot以外の発言だったら
      if (msg.author.id !== '780629853606510592'){
       //絵文字のIDと名前を取得して配列に格納
       const emojiID = [];
       const emojiName = [];
       client.emojis.cache.map((e, x) => emojiID.push(x));
       client.emojis.cache.map((e, x) => emojiName.push(e.name));
       //乱数を使って絵文字をランダムに選ぶ
       const arrayLength = emojiID.length - 1;
       const arrayIndex = Math.floor(Math.random() * arrayLength);
       const reactionEmoji = "<:" + emojiName[arrayIndex] + ":" + emojiID[arrayIndex] + ">";
       //リアクションを実行
       msg.react(reactionEmoji)
      }
    }*/

  //ミュート中のユーザーが聞き専にテキストを送信した場合は読み上げる
  if (
    msg.member.voice.channel &&
    msg.member.guild.voiceStates.cache.get(msg.author.id).selfMute &&
    !msg.content.match(/http/) &&
    !msg.content.match(/@/)
  ) {
    const url = googleTTS.getAudioUrl(msg.content, {
      lang: "ja-JP",
      slow: false,
      host: "https://translate.google.com"
    });
    const connection = await client.channels.cache.get(mainChannelID).join();
    connection.play(url, { volume: 1.0 });
  }

  //#+特定の発言に対して決まった返事をする
  if (msg.content.match(/#/)) {
    //#+上記のリストに存在しない単語が送信された場合対話APIを利用して適当な返事をする
    const dialogue_options = {
      utterance: msg.content,
      agentState: {
        agentName: "あしたからがんばるbot",
        age: "17歳",
        tone: "normal"
      }
    };
    await axios
      .post(chaplusUrl, JSON.stringify(dialogue_options))
      .then(function(response) {
        const data = response.data;
        console.log(data.bestResponse.utterance);
        msg.channel.send(data.bestResponse.utterance);
      });
  }
});