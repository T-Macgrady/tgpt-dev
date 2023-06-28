#!/bin/bash

WRKDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

node "$WRKDIR/src/CompletionCLI.js" $@
