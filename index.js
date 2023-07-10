import {Telegraf, session} from 'telegraf'
import {message} from 'telegraf/filters'
import {code} from 'telegraf/format'
import process from "nodemon";
import config from "config";
import {ogg} from './ogg.js'
import {openAi} from './openAi.js'


console.log(config.get("TEST"))
const INITIAL_SESSION = {
    messages: [],

}


const bot = new Telegraf(config.get("TELEGRAM_TOKEN"))

bot.use(session())

bot.command('new', async (ctx) => {
    ctx.session.INITIAL_SESSION
    await ctx.reply('Жду вашего вопроса')
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Принял жду ответ от сервера...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMP3(oggPath, userId)
        const text = await openAi.transcription(mp3Path)
        await ctx.reply(code(`Ваш запрос ${text}`))
        ctx.session.messages.push({role: openAi.roles.USER, content: text})
        const response = await openAi.chat(ctx.session.messages)
        ctx.session.messages.push({role: openAi.roles.ASSISTANT, content: text})
        await ctx.reply(response.content)
    } catch (e) {
        console.log('error voice message', e)
    }
})

bot.command('start', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message))
})
bot.launch()

process.once('CLOSE', () => bot.stop('CLOSE'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))