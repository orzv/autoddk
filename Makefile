bundle.js:
	deno bundle mod.ts bundle.js

deno:
	curl -o deno.zip -# -fsSL \
	http://deno.devtips.cn/releases/download/v1.2.2/deno-x86_64-unknown-linux-gnu.zip && \
	unzip deno.zip
