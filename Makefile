# this file serves as aliases to useful commands using phony targets
# usage:
# `make serve`
HUGO_VERSION=0.86.1
HUGO=docker run --rm -it \
	-p 127.0.0.1:1313:1313 \
	-v $$(pwd):/src \
	klakegg/hugo:$(HUGO_VERSION)-ext-alpine \
	--bind="0.0.0.0"
# local development, run a local server with hugo
serve:
	$(HUGO) server --ignoreCache --disableFastRender --buildDrafts

# serve, but on the host instead of with docker
serve-native: HUGO=hugo server
serve-native: serve

.PHONY: serve serve-native

clean:
	rm -rf ./resources