const tracer = require('tracer')
const logger = tracer.colorConsole({level: 'trace'})
const AlgoliaSearch = require('algoliasearch')

const Index = class Index {
  constructor(appID, apiKey, indexID) {
    logger.trace('constructor', appID, apiKey, indexID)
    const self = this
    const client = AlgoliaSearch(appID, apiKey, { protocol: 'https:' })
    this.AlgoliaIndex = client.initIndex(indexID)
  }
  getObject(objectID, attributesToRetrieve) {
    logger.trace('getObject', objectID, attributesToRetrieve)
    const self = this
    return new Promise((resolve, reject) => {
      self.AlgoliaIndex.getObject(objectID, attributesToRetrieve, (err, content) => {
        if (err) {
          logger.error(err)
          reject(err)
        } else {
          resolve(content)
        }
      })
    })
  }
  searchObjects(params) {
    logger.trace('searchObjects', params)
    const self = this
    return new Promise((resolve, reject) => {
      self.AlgoliaIndex.search(params, (err, content) => {
    		if (err) {
          logger.error(err);
    			reject(err)
    		} else {
          logger.trace(content)
          resolve(content)
    		}
    	})
    })
  }
  async getFirstFromSearch(params) {
    logger.trace('getFirstFromSearch', params)
    const self = this
    const res = await self.searchObjects(params)
    return res.hits[0]
  }
  async saveObject(user, object) {
    logger.trace('saveObject', user, object)
    const self = this
    if (!object.objectID) delete object.objectID
    const res = await new Promise((resolve, reject) => {
      self.AlgoliaIndex.addObject(object, (err, content) => {
    		if (err) reject(err)
        else resolve(content)
      })
    })
    object.objectID = res.objectID
    return object
  }
  deleteObject(sender, organisationID, objectID) {
    // IS THIS SECURE? DOES IT DIFFERENTIATE BY SENDER????
    logger.trace('deleteObject', sender, organisationID, objectID)
    const self = this
    return new Promise((resolve, reject) => {
    	self.AlgoliaIndex.deleteObject(objectID, (err, content) => {
    		if (err) {
    			logger.error(err)
    			reject(err)
    		} else {
    			logger.trace('User memory deleted successfully!')
    			resolve()
    		}
    	})
    })
  }
}

exports.Index = Index

exports.connect = (appID, apiKey, indexID) => {
  logger.trace('connect', appID, apiKey, indexID)
  const index = new Index(appID, apiKey, indexID)
  return index
}