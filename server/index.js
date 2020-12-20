const needle = require('needle')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN


const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

const rules = [{value: 'coding'}]

//get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    //TODO: comment this out once we get past the current unauthorized error, 
    //      waiting for twitter dev account access and bearer token
    console.log('getRules() response')
    console.log(response.body)
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
    console.log('setRules() response')
    console.log(response.body)
    return response.body
}

//delete stream rules
async function deleteRules(rules) {

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
    console.log('deleteRules() response')
    console.log(response.body)
    return response.body
}


;(async () => {
    let currentRules


    try{
        // get them first, then delete them
        currrentRules = await getRules()
        deleteRules(currentRules)
    }
    catch(error){
        console.log('error getRules()')
        console.log(error)
        process.exit(1)
    }

    try{
        //now we are safe to add them in, they were previously cleared out
        await setRules()
    }
    catch(error){
        console.log('error setRules()')
        console.log(error)
        process.exit(1)
    }
    
})()




//17:09 of traverse media video, paused and taking dog for walk

