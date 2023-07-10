import axios from "axios";
import {createWriteStream} from 'fs'
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import ffmpeg from "fluent-ffmpeg";
import installer from '@ffmpeg-installer/ffmpeg'
const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    toMP3(input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`)
            return new Promise((resolve, reject) => {
                ffmpeg(input)
                    .inputOptions('-t 30')
                    .output(outputPath)
                    .on('end', () => resolve(outputPath))
                    .on('error', (err) => reject(err))
                    .run()
            })
        } catch (e) {
            console.log('Error file creating mp3')
        }
    }
    async create(url, filename) {
        try {
            const oggPath = resolve(__dirname, './voices', `${filename}.ogg`)
            const response = await axios({
                url,
                method: 'get',
                responseType: 'stream'
            })
            return new Promise(resolve => {
                const stream = createWriteStream(oggPath)
                response.data.pipe(stream)
                stream.on('finish', () => resolve(oggPath))
            })
        } catch (e) {
            console.log('method create is false', e)
        }

    }
}


export const ogg = new OggConverter()