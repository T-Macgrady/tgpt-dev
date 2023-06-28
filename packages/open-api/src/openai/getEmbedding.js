/**
 * The following script is used to ask a prompt, and return its completion response
 * 
 * This does not perform any caching / saving, and can be imported, or executed directly
 **/

// Default config settings to use
const defaultConfig = {
	"model": "text-embedding-ada-002"
};

/**
 * Given the prompt config, return the API result
 * 
 * @param {String} openai_key, apikey for the request
 * @param {String | Object} inConfig, containing the prompt or other properties
 * @param {Function} streamListener, for handling streaming requests
 * @param {String} completionURL to use
 * 
 * @return {Sring | Object} completion string, if rawApi == false (default), else return the raw API JSON response
 */
async function getEmbedding(
	openai_key, inConfig, 
	completionURL = 'https://api.openai.com/v1/embeddings'
) {
	// Normalzied string prompt to object
	if (typeof inConfig === 'string' || inConfig instanceof String) {
		inConfig = { prompt: inConfig };
	}
	
	// Join it together
	let reqJson = Object.assign({}, defaultConfig, inConfig);

	// Clean out null values, as openAI does not like it (even if it is by default?)
	for( const key of Object.keys(reqJson) ) {
		if( reqJson[key] === null ) {
			delete reqJson[key];
		}
	}

	// Normalize prompt to input
	reqJson.input = reqJson.input || reqJson.prompt;
	delete reqJson.prompt;

	// Remove rawAPI flag, we will not be supporting it
	let useRawApi = false;
	delete reqJson.rawApi;

	// Non streaming request handling
	//----------------------------------
	let respErr = null;
	for(let tries=0; tries < 2; ++tries) {
		try {
			// Perform the JSON request
			const resp = await fetch(completionURL, {
				method: 'post',
				body: JSON.stringify(reqJson),
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${openai_key}`
				}
			});
			respJson = await resp.json();
			
			// Throw error accordingly
			if( respJson.error ) {
				console.warn( "getCompletion API error", respJson.error)
				throw `[${respJson.error.type}] ${respJson.message}`;
			}
	
			// Check for response
			if( respJson.data && respJson.data[0] && respJson.data[0].embedding ) {
				// Return the JSON as it is
				if( useRawApi ) {
					return respJson;
				}
	
				// Return the full embedding
				return respJson.data[0].embedding;
			}
		} catch(e) {
			respErr = e;
		}
	}
	
	// Handle unexpected response
	if( respErr ) {
		console.warn([
			"## Unable to handle prompt for ...",
			JSON.stringify(reqJson),
			"## Recieved error ...",
			respErr
		].join("\n"));
	} else {
		console.warn([
			"## Unable to handle prompt for ...",
			JSON.stringify(reqJson),
			"## Recieved response ...",
			JSON.stringify(respJson)
		].join("\n"));
	}
	throw Error("Missing valid openai response, please check warn logs for more details")
}

// Export the module
module.exports = getEmbedding;
