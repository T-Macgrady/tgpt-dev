//------------------------------------------------------------------
// Dependencies
//------------------------------------------------------------------
const jsonStringify = require('fast-json-stable-stringify');
const crypto = require('crypto');
const JsonlCache = require('./JsonlCache');
const MongoDBCache = require('./MongoDBCache');

//------------------------------------------------------------------
// Utility function
//------------------------------------------------------------------

// Parameters accepted by cleanPrompt
const cleanPromptKeys = [
	"max_tokens",
	"stop",
	"temperature",
	"top_p",

	// We do not support "n" due to the limitations of our API design
	// it would also be non cache friendly
	// "n",
	
	"presence_penalty",
	"frequency_penalty",

	// NOTE this is not supported in gpt-3.5-turbo onwards
	// "best_of",
	
	"logit_bias",
	"suffix"
];

/**
 * Cleans out the prompt options and make it "cache friendly"
 */
function getCleanPromptOpt(promptOpt) {
	let cleanOpt = {};
	for(const key of cleanPromptKeys) {
		if( promptOpt[key] != null ) {
			cleanOpt[key] = promptOpt[key];
		}
	}
	return cleanOpt;
}

/**
 * Given the prompt, prompt opt, and cacheGrp - build the cacheObj
 * TempKey is excluded, as its NOT used by embeddings
 */
function getCacheObj(prompt, promptOpt, cacheGrp) {
	// Get the clean prompt options
	let cleanOpt = getCleanPromptOpt(promptOpt);

	// Get the hash of both the clean option, and the prompt
	let cleanOptStr = jsonStringify(cleanOpt);
	let hash = getHash(prompt+"-"+cleanOptStr)

	// Prepare the cacheOpt obj
	let cacheObj = {
		cacheGrp: cacheGrp,
		hash: hash,
		promptOpt: promptOpt,
		cleanOpt: cleanOpt,
		cleanOptStr: cleanOptStr,
		prompt: prompt
	};

	// The built cache obj
	return cacheObj;
}

/**
 * Given the string input, get and return the md5 hash
 */
function getHash(str) {
	return crypto.createHash("md5").update(str, "binary").digest("hex");
}

//------------------------------------------------------------------
// Implementation
//------------------------------------------------------------------

/**
 * Provides a multi layer cache, across various cache sources
 * Its primary purpose is to provide caching for prompts and embeddings.
 */
class LayerCache {

	constructor(inConfig) {
		if( inConfig.localJsonlDir.enable == true ) {
			this.jsonlCache = new JsonlCache(inConfig.localJsonlDir.path);
		}
		if( inConfig.mongoDB.enable == true ) {
			this.mongoCache = new MongoDBCache(inConfig.mongoDB.url);
		}

		// Get the cache settings
		this._promptCache_enable = inConfig.promptCache || false;
		this._embeddingCache_enable = inConfig.embeddingCache || false;
	}

	async setup() {
		if( this.jsonlCache ) {
			await this.jsonlCache.setup();
		}
		if( this.mongoCache ) {
			await this.mongoCache.setup();
		}
	}

	/**
	 * Given the prompt, and its options, return its completion if its found in cache.
	 * Else return null (no valid result)
	 * 
	 * @param {String} prompt to use
	 * @param {Object} promptOpt options to use
	 * @param {String} cacheGrp to use for caching
	 * @param {int}    tempKey for cache hit
	 */
	 async getCacheCompletion(prompt, promptOpt, cacheGrp = "default", tempKey = 0) {
		// Skip, if disabled
		if( !this._promptCache_enable ) {
			return;
		}

		// Cache object to use (with tempKey)
		let cacheObj = getCacheObj(prompt, promptOpt, cacheGrp);
		cacheObj.tempKey = tempKey;

		// Cache result
		let cacheRes = null;

		// Try to get from local cache
		if( this.jsonlCache ) {
			cacheRes = await this.jsonlCache.getCacheCompletion(cacheObj);
			// console.log("jsonl", cacheRes);
			if( cacheRes ) {
				return cacheRes;
			}
		}

		// Get from remote mongo cache
		if( this.mongoCache ) {
			cacheRes = await this.mongoCache.getCacheCompletion(cacheObj);
			// console.log("mongo", cacheRes);
			if( cacheRes ) {
				// Transfer to local if possible
				if( this.jsonlCache ) {
					this.jsonlCache.addCacheCompletion(cacheObj, cacheRes);
				}

				// Return
				return cacheRes;
			}
		}

		// Nothing found, return null
		return null;
	}
	
	/**
	 * Given the prompt, its options, and its completion.
	 * Add it into the cache layer
	 * 
	 * @param {String} prompt to use
	 * @param {String} completion to store
	 * @param {Object} promptOpt options to use
	 * @param {String} cacheGrp to use for caching
	 * @param {int}    tempKey for cache hit
	 */
	 async addCacheCompletion(prompt, completion, promptOpt, cacheGrp = "default", tempKey = 0) {
		// Skip, if disabled
		if( !this._promptCache_enable ) {
			return;
		}

		// Cache object to use (with tempKey)
		let cacheObj = getCacheObj(prompt, promptOpt, cacheGrp);
		cacheObj.tempKey = tempKey;

		// Cache result array (to await at the end)
		let cacheResArr = [];

		// Try to add to various cache
		if( this.jsonlCache ) {
			cacheResArr.push( this.jsonlCache.addCacheCompletion(cacheObj, completion) );
		}
		if( this.mongoCache ) {
			cacheResArr.push( this.mongoCache.addCacheCompletion(cacheObj, completion) );
		}

		// Await for all
		await Promise.all(cacheResArr);

		// Add to cache completed
		return;
	}
	
	/**
	 * Given the prompt, and its options, return its completion if its found in cache.
	 * Else return null (no valid result)
	 * 
	 * @param {String} prompt to use
	 * @param {Object} promptOpt options to use
	 * @param {String} cacheGrp to use for caching
	 * @param {int}    tempKey for cache hit
	 */
	 async getCacheChatCompletion(prompt, promptOpt, cacheGrp = "default", tempKey = 0) {
		// Skip, if disabled
		if( !this._promptCache_enable ) {
			return;
		}

		// Cache object to use (with tempKey)
		let cacheObj = getCacheObj(prompt, promptOpt, cacheGrp);
		cacheObj.tempKey = tempKey;

		// Cache result
		let cacheRes = null;

		// Try to get from local cache
		if( this.jsonlCache ) {
			cacheRes = await this.jsonlCache.getCacheChatCompletion(cacheObj);
			// console.log("jsonl", cacheRes);
			if( cacheRes ) {
				return cacheRes;
			}
		}

		// Get from remote mongo cache
		if( this.mongoCache ) {
			cacheRes = await this.mongoCache.getCacheChatCompletion(cacheObj);
			// console.log("mongo", cacheRes);
			if( cacheRes ) {
				// Transfer to local if possible
				if( this.jsonlCache ) {
					this.jsonlCache.addCacheChatCompletion(cacheObj, cacheRes);
				}

				// Return
				return cacheRes;
			}
		}

		// Nothing found, return null
		return null;
	}
	
	/**
	 * Given the prompt, its options, and its completion.
	 * Add it into the cache layer
	 * 
	 * @param {String} prompt to use
	 * @param {String} completion to store
	 * @param {Object} promptOpt options to use
	 * @param {String} cacheGrp to use for caching
	 * @param {int}    tempKey for cache hit
	 */
	 async addCacheChatCompletion(prompt, completion, promptOpt, cacheGrp = "default", tempKey = 0) {
		// Skip, if disabled
		if( !this._promptCache_enable ) {
			return;
		}

		// Cache object to use (with tempKey)
		let cacheObj = getCacheObj(prompt, promptOpt, cacheGrp);
		cacheObj.tempKey = tempKey;

		// Cache result array (to await at the end)
		let cacheResArr = [];

		// Try to add to various cache
		if( this.jsonlCache ) {
			cacheResArr.push( this.jsonlCache.addCacheChatCompletion(cacheObj, completion) );
		}
		if( this.mongoCache ) {
			cacheResArr.push( this.mongoCache.addCacheChatCompletion(cacheObj, completion) );
		}

		// Await for all
		await Promise.all(cacheResArr);

		// Add to cache completed
		return;
	}
	
	/**
	 * Given the prompt, and its options, return the embedding if its found in cache.
	 * Else return null (no valid result)
	 * 
	 * @param {String} prompt to use
	 * @param {Object} embeddingOpt options to use
	 * @param {String} cacheGrp to use for caching
	 */
	 async getCacheEmbedding(prompt, embeddingOpt, cacheGrp = "default") {
		// Skip, if disabled
		if( !this._embeddingCache_enable ) {
			return;
		}

		// Cache object to use (with tempKey)
		let cacheObj = getCacheObj(prompt, embeddingOpt, cacheGrp);

		// Cache result
		let cacheRes = null;

		// Try to get from local cache
		if( this.jsonlCache ) {
			cacheRes = await this.jsonlCache.getCacheEmbedding(cacheObj);
			if( cacheRes ) {
				return cacheRes;
			}
		}

		// Get from remote mongo cache
		if( this.mongoCache ) {
			cacheRes = await this.mongoCache.getCacheEmbedding(cacheObj);
			if( cacheRes ) {
				// Transfer to local if possible
				if( this.jsonlCache ) {
					this.jsonlCache.addCacheCompletion(cacheObj, cacheRes);
				}

				// Return
				return cacheRes;
			}
		}

		// Nothing found, return null
		return null;
	}
	
	/**
	 * Given the prompt, its options, and its completion.
	 * Add it into the cache layer
	 * 
	 * @param {String} prompt to use
	 * @param {*} embedding to store
	 * @param {Object} embeddingOpt options to use
	 * @param {String} cacheGrp to use for caching
	 */
	 async addCacheEmbedding(prompt, embedding, embeddingOpt, cacheGrp = "default") {
		// Skip, if disabled
		if( !this._embeddingCache_enable ) {
			return;
		}

		// Cache object to use (with tempKey)
		let cacheObj = getCacheObj(prompt, embeddingOpt, cacheGrp);

		// Cache result array (to await at the end)
		let cacheResArr = [];

		// Try to add to various cache
		if( this.jsonlCache ) {
			cacheResArr.push( this.jsonlCache.addCacheEmbedding(cacheObj, embedding) );
		}
		if( this.mongoCache ) {
			cacheResArr.push( this.mongoCache.addCacheEmbedding(cacheObj, embedding) );
		}

		// Await for all
		await Promise.all(cacheResArr);

		// Add to cache completed
		return;
	}
}
module.exports = LayerCache;