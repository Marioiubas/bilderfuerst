#!/bin/sh
# Launch a throwaway headless Chrome with CDP on $1 (default 9871) for scripts/perf/webgl-probe.mjs.
PORT=${1:-9871}; PROFILE=${2:-${TMPDIR:-/tmp}/bf-perf-chrome}
exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE" --no-first-run --no-default-browser-check --disable-extensions --hide-scrollbars about:blank
