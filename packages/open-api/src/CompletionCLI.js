const AiBridge = require("./AiBridge");
const fs = require("fs");
const path = require("path");
const Hjson = require('hjson');

// Special direct execution handling
// https://stackoverflow.com/questions/6398196/detect-if-called-through-require-or-directly-by-command-line
if( require.main === module ) {
	(async function() {

		// Argument check
		const reqPrompt = process.argv.slice(2).join(" ");
		if( reqPrompt == null ) {
			console.error( "[ERROR] Missing request prompt as first argument" );
			console.error( `[ERROR] Example: node ./CompletionCLI.js "tell me a joke?"` );
			process.exit(1);
		}

        // Read the config file
        let configJsonStr = await fs.promises.readFile( path.resolve( process.cwd(), "./config.jsonc" ), "utf8" );
        let configJson = Hjson.parse(configJsonStr);

        // Given the config, setup the AiBridge
        let bridge = new AiBridge(configJson);
        await bridge.setup();

		// Get the completion
		const resp = await bridge.getCompletion(reqPrompt);
		console.log(resp.completion);
		console.log(resp.token);

        // Exit, because of the hanging mongodb connections
        process.exit();
	})();
} else {
    throw "Not executed directly via CLI"
}