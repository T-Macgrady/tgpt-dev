//--------------------------------------------
// default config JSON for ai-bridge
//--------------------------------------------
module.exports = {
	// The following is defines
	// the apikeys for the various providers
	//----------------------------------------
	
	"provider": {
		// For openAI, all you will need is the apikey
		"openai": null,

		// // For forefront.ai, you will need to provide both an API key
		// // and a URL mapping for each model
		// "forefront.ai": {
		// 	"apikey": null,
		// 	"models": {
		// 	}
		// }
	},

	// Concurrent provider access
	// use to reate limit API request
	//
	// Is not used to rate limit cache checks
	//----------------------------------------
	
	// Number of provider requests that can occur concurrently
	"providerRateLimit": 1,

	// Latency delay between request, to be used with rate limit, to further "tune down"
	"providerLatencyAdd": 100,

	// Custom model mapping,
	// This is used to divert operations on a model to model level
	//
	// If not configured, by default it will use the openai implementation 
	// (if apikey is set)
	//
	// This is useful for model aliasing, and swapping out at a config level.
	//----------------------------------------

	"modelmap" : {
	},

	// Caching controls
	//----------------------------------------

	"cache": {
		// Local dir, to store multiple jsonl files, which is used for caching
		"localJsonlDir": {
			"enable": true,
			"path": "./.ai-bridge-cache"
		},

		// MongoDB connection, to store and query cached completion request
		"mongoDB": {
			"enable": false,
			"url": null
		},

		// Enable caching by default
		"promptCache": true,
		"embeddingCache": true
	},

	// AI bridge settings
	//----------------------------------------

	// Used as a multiple of temprature value, which will decide the maximum number
	// of permutations any prompt would be cached with. With a minimum of 1
	//
	// A tempKeyMultiplier of 10 will store the following number of records per unique prompt settings
	// - 10 total variation with a temprature of 10
	// - 1 total varation with a temprature of 0
	// 
	// Note that having different settings, like stop character, etc. Will result to a different cache record.
	"temperatureKeyMultiplier" : 3,

	// Default settings overwrite
	//
	// Note the implementation/change for
	// - temprature
	// - total_tokens
	//
	// Rest is pretty much stock settings
	//----------------------------------------

	"default": {

		"completion": {
			// Default model to use
			"model": "gpt-3.5-turbo",

			// Total tokens computes the max_tokens
			// using the current prompt.
			//
			// This setting is ignored if max_tokens is set
			"total_tokens": 4080,

			// Maximum token to use for generation
			"max_tokens": null,

			// // Default prompt and stop token
			// "prompt": "<|endoftext|>",
			// "stop": "<|endoftext|>",

			// Default temperature to use, we set to 0
			// by default, as this makes all prompts highly cachable.
			//
			// range from 0-1
			"temperature": 0,

			// // Nucleaus sampling (see docs for more details)
			// //
			// // range from 0-1
			// "top_p": 1,

			// // Number of completion to create
			// // generally recommended to do multiple calls instead
			// "n": 1,

			// Enable / Disable streaming, callback function should be
			// set if stream is enabled
			"stream": false,

			// Presence and frequency penalties, refer to docs for more details
			"presence_penalty": 0,
			"frequency_penalty": 0,

			// // When use with N, decide the number possible answer to evaluate from
			// // IMHO, highly not recommended to be used. 
			// // As its unclear/unpredictable on how one sample is chosen over another.
			// "best_of":1,

			// Proabability modification for individual tokens
			// avoid using, unless you really know what your doing
			"logit_bias": null,

			// String to append at the end of response
			// just dun use this, and do the appending directly
			"suffix": null,

			// This is ignored on cache reads, but is sent on prompt request
			"user": null,

			// This setting is ignored, as we do not cache the log probabilities
			"logprobs": null
		},

		"embedding": {
			// Default model to use
			"model": "text-embedding-ada-002",

			// This is ignored on cache reads, but is sent on prompt request
			"user": null
		},

		"chat": {
			"model": "gpt-3.5-turbo",
			"temperature": 0,
		
			"total_tokens": 20000,
			"max_tokens": null,
		
			"top_p": 1,
			"frequency_penalty": 0,
			"presence_penalty": 0,
		
			// Important note!: we split the endoftext token very
			// intentionally,to avoid causing issues when this file is parsed
			// by GPT-3 based AI.
		
			// // Default stop keyword
			// "stop": ["<|"+"endoftext"+"|>"],
		
			// Return as a string if false, 
			// else return the raw openAI API response
			"rawApi": false
		}
	}
}