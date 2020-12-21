const needle = require('needle')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN


const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

const rules = [{value: 'nflxxxxx'},{value: 'new england patriots'}]

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



function stramTweets(){
    const stream = needle.get(streamURL,{
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    stream.on('data',(data)=>{
        try{
            const json = JSON.parse(data)
            console.log(json)

        }catch(error){
            //console.log(error)
        }

    })
}
;(async () => {
    let currentRules

    try{
        // get all rules
        currentRules = await getRules()
        // wipe it clean
        await deleteRules(currentRules)
        // set rules based on current rules array
        await setRules()
        
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
   stramTweets()
})()

// left off at 20:20 of traversy youtube video