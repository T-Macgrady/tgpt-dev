//------------------------------------------------------------------
// Dependencies
//------------------------------------------------------------------

const { MongoClient } = require('mongodb');

//------------------------------------------------------------------
// Utility function
//------------------------------------------------------------------

/**
 * Given the type and cacheObj, get the full collection name
 */
function getCacheCollectionName(type, cacheObj) {
	return type + '_' + cacheObj.promptOpt.model;
}

//------------------------------------------------------------------
// Implementation
//------------------------------------------------------------------

/**
 * # MongoDB Cache context
 * 
 * NOTE: This is not designed to be used directly, and is meant to be used with LayerCache instance
 * 
 * Provides a mongodb based cache, which can be shared with multiple team members.
 * 
 * # MongoDBCache collection structure
 * 
 * {completion|embedding}_{model-name}
 */
 class MongoDBCache {

	/**
	 * Setup with the mongoDB URL
	 */
	constructor(mongoURL) {
		this.mongoClient = new MongoClient(mongoURL);
	}

	/** 
	 * Does any async based setup, which might be required
	 */
	async setup() {
		await this.mongoClient.connect();
	}

	// Completion API cache
	// ---------------------

	/**
	 * Given the cacheObj, search and get the completion record in cache.
	 */
	async getCacheCompletion(cacheObj) {
		return await this._getCacheCompletion(cacheObj, "completion");
	}

	/**
	 * Add the completion record into cache,
	 */
	async addCacheCompletion(cacheObj, completion) {
		return await this._addCacheCompletion(cacheObj, completion, "completion");
	}

	// Chat API cache
	// ---------------------

	/**
	 * Given the cacheObj, search and get the completion record in cache.
	 */
	 async getCacheChatCompletion(cacheObj) {
		return await this._getCacheCompletion(cacheObj, "chat");
	}

	/**
	 * Add the completion record into cache,
	 */
	async addCacheChatCompletion(cacheObj, completion) {
		return await this._addCacheCompletion(cacheObj, completion, "chat");
	}

	// Chat/Completion API cache
	// ---------------------

	/**
	 * [Internal] get cache completion, 
	 * which is used by both the chat and normal completion
	 */
	async _getCacheCompletion(cacheObj, collectionNamePrefix = "completion") {
		// Get the collection name
		let collectionName = getCacheCollectionName(collectionNamePrefix, cacheObj);

		// Connect to the collection
		let collection = this.mongoClient.db().collection(collectionName);

		// Search for the record
		let record = await collection.findOne({
			// We use a hash based lookup, as its the most efficent
			hash: cacheObj.hash,

			// Followed by tempkey
			tempKey: cacheObj.tempKey,

			// And the actual prompt
			prompt: cacheObj.prompt,

			// And finally the option for the prompt
			opt: cacheObj.cleanOpt
		});

		// And return
		if(record && record.completion) {
			return record.completion;
		} else {
			return null;
		}
	}

	/**
	 * [Internal] add the completion record into cache,
	 * which is used by both the chat and normal completion
	 */
	async _addCacheCompletion(cacheObj, completion, collectionNamePrefix = "completion") {
		// Get the collection name
		let collectionName = getCacheCollectionName(collectionNamePrefix, cacheObj);

		// Connect to the collection
		let collection = this.mongoClient.db().collection(collectionName);

		// Upsert the record
		await collection.updateOne(
			{
				hash: cacheObj.hash,
				tempKey: cacheObj.tempKey,
				prompt: cacheObj.prompt,
				opt: cacheObj.cleanOpt
			},
			{
				$set: {
					// Store the completion
					completion:completion,
					// Cache groups are used to organize records for analytics
					cacheGrp:cacheObj.cacheGrp
				}
			},
			{
				upsert: true
			}
		);

		// And return
		return;
	}

	// Embedding API cache
	// ---------------------

	/**
	 * Given the cacheObj, search and get the completion record in cache.
	 */
	async getCacheEmbedding(cacheObj) {
		// Get the collection name
		let collectionName = getCacheCollectionName("embedding", cacheObj);

		// Connect to the collection
		let collection = this.mongoClient.db().collection(collectionName);

		// Normalize prompt / input
		let prompt = cacheObj.prompt || cacheObj.input;
		
		// Search for the record
		let record = await collection.findOne({
			hash: cacheObj.hash,
			prompt: prompt,

			// Excluded from search, as options kind dun matter here
			// opt: cacheObj.cleanOpt
		});

		// And return
		if(record) {
			return record.embedding;
		} else {
			return null;
		}
	}

	/**
	 * Given the cacheObj, add the completion record into cache
	 */
	async addCacheEmbedding(cacheObj, embedding) {
		// Get the collection name
		let collectionName = getCacheCollectionName("embedding", cacheObj);

		// Connect to the collection
		let collection = this.mongoClient.db().collection(collectionName);

		// Normalize prompt / input
		let prompt = cacheObj.prompt || cacheObj.input;
		
		// Upsert the record
		await collection.updateOne(
			{
				hash: cacheObj.hash,
				prompt: prompt,
				opt: cacheObj.cleanOpt
			},
			{
				$set: {
					// Store the embedding
					embedding: embedding,
					// Cache groups are used to organize records for analytics
					cacheGrp:cacheObj.cacheGrp
				}
			},
			{
				upsert: true
			}
		);

		// And return
		return;
	}
}
module.exports = MongoDBCache;