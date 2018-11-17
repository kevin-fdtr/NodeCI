const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')
const keys = require('../config/keys')

// location of in-memory data cache
const client = redis.createClient(keys.redisUrl)

client.hget = util.promisify(client.hget)

// "monkey patch" mongoose Query to check if query results are already in cache before executing query
const exec = mongoose.Query.prototype.exec
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true
  this.hashKey = JSON.stringify(options.key || '')
  return this
}
mongoose.Query.prototype.exec = async function () {
  
  if (!this.useCache) {
    // not caching so just execute query to database
    return exec.apply(this, arguments)
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }))

  // if we have value for query key in cache, return it
  const cacheValue = await client.hget(this.hashKey, key)
  if (cacheValue) {
    console.log('From Cache')
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc) ? doc.map(d => this.model(d)) : new this.model(doc)
  }
  // since we did not find query results in cache, execute query to database and then store result in cache
  const result = await exec.apply(this, arguments)

  client.hset(this.hashKey, key, JSON.stringify(result))
  
  return result
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}