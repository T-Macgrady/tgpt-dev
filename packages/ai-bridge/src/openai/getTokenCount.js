// Initialize the tokenizer
const GPT3Tokenizer = require('gpt3-tokenizer').default;
let tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

/**
 * Get the token count of the given text
 * @param {String} text 
 * @returns {int}
 */
module.exports = function getTokenCount(text) {
	if(text == null || text == "") {
		return 0;
	}

	// There seem to be some existing token cache error
	// So we will just reinitialize the tokenizer when it occurs
	try {
		return tokenizer.encode(text).bpe.length;
	} catch (e) {
        // Reinitialize the tokenizer
		tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

        // Log the text
        console.log("Error in getTokenCount: ", text);

        // Return the token count
		return tokenizer.encode(text).bpe.length;
	}
}