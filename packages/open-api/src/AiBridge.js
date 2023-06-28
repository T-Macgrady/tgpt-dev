// Dependencies
// ---
const configObjectMerge = require("@js-util/config-object-merge");
const LayerCache = require("./cache/LayerCache");
const defaultConfig = require("./core/defaultConfig");
const PromiseQueue = require("promise-queue")
const sleep = require('sleep-promise');
const jsonStringify = require('fast-json-stable-stringify');

// OpenAI calls
const getChatCompletion = require("./openai/getChatCompletion");
const getCompletion = require("./openai/getCompletion");
const getEmbedding = require("./openai/getEmbedding");
const getTokenCount = require("./openai/getTokenCount");

// Implementation
// ---

/**
 * Setup the AiBridge instance with the provided configuration
 */
class AiBridge {

	/**
	 * Setup the bridge with the relevent config. See config.sample.jsonc for more details.
	 * @param {Object} inConfig 
	 */
	constructor(inConfig) {
		// Merge the provided config with default values
		this.config = configObjectMerge(defaultConfig, inConfig, true);

		// Get the layer cache
		this.layerCache = new LayerCache(this.config.cache);

		// Get the openai key 
		this._openai_key = this.config.provider.openai;
		if( this._openai_key == null || this._openai_key == "" ) {
			throw "Missing valid openai key"
		}

		// Setup the promise queue
		this._pQueue = new PromiseQueue(this.config.providerRateLimit);
	}

	/**
	 * Perform any async setup, as required
	 */
	async setup() {
		if( this.layerCache ) {
			await this.layerCache.setup();
		}
	}

	/**
	 * Given the prompt string, get the token count - not actually cached
	 * (Should I?)
	 * 
	 * @param {String} prompt 
	 */
	async getTokenCount(prompt) {
		return getTokenCount(prompt);
	}

	/**
	 * Get the completion of the input string
	 * 
	 * @param {String} prompt to use
	 * @param {Object} promptOpts prompt options to use, merged with default
	 * @param {Function} streamListener, for handling streaming requests
	 * 
	 * @param {String} cacheGrp to cache under, used for grouping cache requests
	 * @param {Number} tempKey to use, automatically generated if -1
	 */
	async getCompletion(prompt, promptOpts = {}, streamListener = null, cacheGrp = "default", tempKey = -1) {
		// self ref
		let self = this;

		// Safety
		if( streamListener == null ) {
			streamListener = () => {};
		}

		// Merge the options with the default
		let opt = Object.assign({}, this.config.default.completion, promptOpts);
		opt.prompt = prompt;

		// Parse the prompt, and compute its token count
		let promptTokenCount = getTokenCount( prompt );
		
		// Parse the prompt, and compute its token count
		opt = normalizeCompletionOptObject(opt, promptTokenCount);
		let model = opt.model;

		// Generate the temp key, in accordence to the tempreture setting
		if( tempKey < 0 ) {
			if( opt.temperature == 0 ) {
				tempKey = 0;
			}

			let tempRange = parseFloat(opt.temperature) * parseFloat(this.config.temperatureKeyMultiplier);
			if( Math.floor(tempRange) <= 0 ) {
				tempKey = 0;
			} else {
				tempKey = Math.floor( Math.random() * tempRange );
			}
		}

		// Get the completion from cache if possible
		let cacheRes = await this.layerCache.getCacheCompletion(prompt, opt, cacheGrp, tempKey);
		if (cacheRes != null) {
			await streamListener(cacheRes);
			return {
				model: model,
				completion: cacheRes,
				token: {
					prompt: promptTokenCount,
					completion: getTokenCount(cacheRes),
					cache: true
				}
			};
		}
		
		// Fallback, get from the openAI API, without caching
		let openai_key = this._openai_key;
		let completionRes = await this._pQueue.add(async function() {
			let ret = await getCompletion(openai_key, opt, streamListener);

			// Thorttling controls
			if(self.config.providerLatencyAdd > 0) {
				await sleep(self.config.providerLatencyAdd);
			}
			return ret;
		});

		// Add to cache
		await this.layerCache.addCacheCompletion(prompt, completionRes, opt, cacheGrp, tempKey);

		// Return full completion
		return {
			model: model,
			completion: completionRes,
			token: {
				prompt: promptTokenCount,
				completion: getTokenCount(completionRes),
				cache: false
			}
		};
	}

	/**
	 * Get the completion of a chat
	 * 
	 * @param {Array<Object>} messages array, containing object with role/content to use
	 * @param {Object} promptOpts prompt options to use, merged with default
	 * @param {Function} streamListener, for handling streaming requests
	 * 
	 * @param {String} cacheGrp to cache under, used for grouping cache requests
	 * @param {Number} tempKey to use, automatically generated if -1
	 */
	 async getChatCompletion(messages, promptOpts = {}, streamListener = null, cacheGrp = "default", tempKey = -1) {
		// self ref
		let self = this;

		// Safety
		if( streamListener == null ) {
			streamListener = () => {};
		}

		// Normalize prompt if its a string, to the right format
		if( typeof messages == "string" || messages instanceof String ) {
			messages = [{
				role: "user",
				content: messages
			}];
		} else if( !Array.isArray(messages) && messages.role != null && messages.content != null ) {
			messages = [messages];
		}

		// Merge the options with the default
		let opt = Object.assign({}, this.config.default.chat, promptOpts);
		opt.messages = messages;

		// Convert the messages to a string, for cache indexing
		let prompt = jsonStringify(messages);

		// Parse the prompt, and compute its token count
		let promptTokenCount = getTokenCount( prompt );

		// Parse the prompt, and compute its token count
		opt = normalizeCompletionOptObject(opt, promptTokenCount, messages);
		let model = opt.model;

		// Generate the temp key, in accordence to the tempreture setting
		if( tempKey < 0 ) {
			if( opt.temperature == 0 ) {
				tempKey = 0;
			}

			let tempRange = parseFloat(opt.temperature) * parseFloat(this.config.temperatureKeyMultiplier);
			if( Math.floor(tempRange) <= 0 ) {
				tempKey = 0;
			} else {
				tempKey = Math.floor( Math.random() * tempRange );
			}
		}

		// Get the completion from cache if possible
		let cacheRes = await this.layerCache.getCacheChatCompletion(prompt, opt, cacheGrp, tempKey);
		if (cacheRes != null) {
			await streamListener(cacheRes);
			return {
				model: model,
				completion: cacheRes,
				token: {
					prompt: promptTokenCount,
					completion: getTokenCount(cacheRes),
					cache: true
				}
			};
		}
		
		// Fallback, get from the openAI API, without caching
		let openai_key = this._openai_key;
		let completionRes = await this._pQueue.add(async function() {
			let ret = await getChatCompletion(openai_key, opt, streamListener);

			// Thorttling controls
			if(self.config.providerLatencyAdd > 0) {
				await sleep(self.config.providerLatencyAdd);
			}
			return ret;
		});

		// Add to cache
		await this.layerCache.addCacheChatCompletion(prompt, completionRes, opt, cacheGrp, tempKey);

		// Return full completion
		return {
			model: model,
			completion: completionRes,
			token: {
				prompt: promptTokenCount,
				completion: getTokenCount(completionRes),
				cache: false
			}
		};
	}

	/**
	 * Get the embedding of the input string
	 * @param {String} prompt 
	 * @param {Object} embeddingOpt 
	 * @param {String} cacheGrp 
	 */
	async getEmbedding(prompt, embeddingOpt = {}, cacheGrp = "default") {
		// self ref
		let self = this;

		// Merge the options with the default
		let opt = Object.assign({}, this.config.default.embedding, embeddingOpt);
		opt.prompt = prompt;
		let model = opt.model;

		// Get from the cache
		let cacheRes = await this.layerCache.getCacheEmbedding(prompt, opt, cacheGrp);
		if (cacheRes) {
			return {
				model: model,
				embedding: cacheRes,
				token: {
					embedding: getTokenCount(prompt),
					cache: true
				}
			};
		}

		// Get the openai embedding
		let openai_key = this._openai_key;
		let embeddingRes = await this._pQueue.add(async function() {
			let ret = await getEmbedding(openai_key, opt);

			// Thorttling controls
			if(self.config.providerLatencyAdd > 0) {
				await sleep(self.config.providerLatencyAdd);
			}
			return ret;
		});

		// Add the result into cache
		await this.layerCache.addCacheEmbedding(prompt, embeddingRes, opt, cacheGrp);

		// And return the result
		return {
			model: model,
			embedding: embeddingRes,
			token: {
				embedding: getTokenCount(prompt),
				cache: false
			}
		};
	}
}

// Utility functions
// ---

/**
 * Given the prompt and the options, normalize the options
 * @param {Object} opt 
 * @param {int} promptStr
 * @param {Array} messagesArr
 */
function normalizeCompletionOptObject(opt, promptTokenCount, messagesArr) {
	// Get the model
	let model = opt.model || "gpt-3.5-turbo";

	// Special handling for gpt-4-e (economical)
	if( model == "gpt-4e" ) {
		// Check if the prompt is under 2025 tokens
		if( promptTokenCount < 2025 ) {
			// if so we use gpt-3.5 turbo instead
			model = "gpt-3.5-turbo";
		} else {
			// otherwise we use gpt-4
			model = "gpt-4";
		}
	}
	opt.model = model;

	// Normalize "max_tokens" auto
	if( opt.max_tokens == "auto" || opt.max_tokens == null ) {
		let autoTotalTokens = 4050;
		if( model.startsWith("gpt-4") ) {
			autoTotalTokens = 8000;
		}
		let totalTokens = opt.total_tokens || autoTotalTokens;

		// Get the estimated token length
		let tokenLength = promptTokenCount;
		if( messagesArr != null ) {
			tokenLength += messagesArr.length * 2;
		}

		// Set the max_tokens
		opt.max_tokens = totalTokens - tokenLength
		if( opt.max_tokens <= 50 ) {
			throw `Prompt is larger or nearly equal to total token count (${tokenLength}/${totalTokens})`;
		}
	}

	// Return updated opt
	return opt;
}

// module export
// ---
module.exports = AiBridge;
