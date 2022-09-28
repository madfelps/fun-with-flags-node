import express,  {Router, Request, Response, response} from 'express'
import axios from 'axios'
//import exphbs from 'express-handlebars'
const exphbs = require('express-handlebars')
const mysql = require('mysql2')
const fs = require('fs')

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'db_flags'
})

conn.connect(function(err: any) {
    if(err) console.log(err)

    console.log('Conectou ao MySQL!')
})

const app = express();

import path from 'path'

const route = Router()

app.use(express.json())
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(express.static('public'))

async function sendImage(code: string, res: Response){
    
    console.log(`code dentro da sendImage: ${code}`)
    let url = `https://countryflagsapi.com/png/${code}`
    const arrayBuffer = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    let buffer = Buffer.from(arrayBuffer.data,'binary').toString("base64");
    
    let image = `data:${arrayBuffer.headers["content-type"]};base64,${buffer}`;
    res.render('home', {image: image})
    
    return new Promise<string>((resolve, reject) => {
        resolve('Resolveu sendImage')
        reject('Não resolveu')
    })
}

async function generateRandomCode()
{
    let url: string

    const randomQuery: string = `SELECT * 
        FROM db_flags.flags_table
        WHERE played = 0
        ORDER BY RAND()
        LIMIT 1`
    
    let dataRandom: any
    let code: string = ''
    conn.query(randomQuery, function(err: any, data: any) {
        if(err){
            console.log(err)
            return
        }

        dataRandom = data

        code = dataRandom[0]['code']
        console.log(`Aqui gera o code após fazer a query: ${code}`)

    })

    return new Promise<string>((resolve, reject) => {
        resolve(code)
        reject('Não resolveu')
    })
}

route.get('/', async (req: Request, res: Response) => {
    let code: string = await generateRandomCode()
    console.log(`code após await: ${code}`)
    await sendImage(code, res)
    
})

route.get('/teste', async (req: Request, res: Response) => {
    let url = 'https://countryflagsapi.com/png/124'
    const arrayBuffer = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    let buffer = Buffer.from(arrayBuffer.data,'binary').toString("base64");
    
    let image = `data:${arrayBuffer.headers["content-type"]};base64,${buffer}`;
    console.log(`image: ${image}`)
    console.log('--------------------------------------')
    res.send(`<img src="${image}"/>`);
})

app.use(route)

async function consumeAPI(){
    let url = 'https://countryflagsapi.com/png/124'
    const arrayBuffer = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    let buffer = Buffer.from(arrayBuffer.data,'binary').toString("base64");
    let image = `data:${arrayBuffer.headers["content-type"]};base64,${buffer}`;
}

consumeAPI()


app.use(express.static(__dirname + '/../views'))

app.listen(3333, () => 'server running on port')