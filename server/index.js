const http = require('http')
const path = require('path')
const express = require('express')
const socketIo = require('socket.io')
const needle = require('needle')
const { SSL_OP_SINGLE_DH_USE, SSL_OP_MSIE_SSLV2_RSA_PADDING } = require('constants')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 3000


///////////////////////////////////////////////
//// RULES HERE
////

//  multiple rules would look like this
//  const rules = [{value: 'nflxxxxx'},{value: 'new england patriots'}]

const rules = [{value: 'xbox one'}]

////
////
///////////////////////////////////////////////



const app = express() //todo: learn express

const server = http.createServer(app)

const io = socketIo(server)

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname,'../','client','index.html'))
})

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'


//get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    //console.log('getRules() response')
    //console.log(response.body)
    return response.body
}

//set stream rules
async function setRules() {

    const data = {
        add: rules
    }
    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })
    //console.log('setRules() response')
    //console.log(response.body)
    return response.body
}

//delete stream rules
async function deleteRules(rules) {

    //console.log('here at the wall')
    if (!Array.isArray(rules.data)){
        return null
    }

    const ids = rules.data.map((rule) => rule.id)

    const data = {
        delete:{
            ids: ids
        }
    }
    
    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    return response.body
}

function streamTweets(socket){
    const stream = needle.get(streamURL,{
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    stream.on('data',(data)=>{
        try{
            const json = JSON.parse(data)
            //console.log(json)
            socket.emit('tweet', json)
        }catch(error){
            //console.log(error)
        }

    })
}


io.on('connection', async ()=> {
console.log('client connected...')
    let currentRules

    try{
        // get all rules
        currentRules = await getRules()
        // wipe it clean
        await deleteRules(currentRules)
        // set rules based on current rules array
        await setRules()
        
        currentRules = await getRules()
        console.log(currentRules)
    }
    catch(error){
        console.log(error)
        process.exit(1)
    }

    try{
        //now we are safe to add them in, they were previously cleared out
        //await setRules()
    }
    catch(error){
        //console.log('error setRules()')
        console.log(error)
        process.exit(1)
    }
   streamTweets(io)

})
// ;(async () => {
//     let currentRules

//     try{
//         // get all rules
//         currentRules = await getRules()
//         // wipe it clean
//         await deleteRules(currentRules)
//         // set rules based on current rules array
//         await setRules()
        
//         currentRules = await getRules()
//         console.log(currentRules)
//     }
//     catch(error){
//         console.log(error)
//         process.exit(1)
//     }

//     try{
//         //now we are safe to add them in, they were previously cleared out
//         //await setRules()
//     }
//     catch(error){
//         //console.log('error setRules()')
//         console.log(error)
//         process.exit(1)
//     }
//    streamTweets()
// })()


server.listen(PORT, ()=> console.log(`listening on port ${PORT}`))


// left off at 20:20 of traversy youtube video