.DEFAULT_GOAL := help

.PHONY: help
help: ## show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

docker-build: ## build docker image
	docker build -t tasks:latest .

docker-sh: docker-build ## enter in the docker image
	docker run -it --rm -p 8080:8080 tasks:latest sh

docker-run: docker-build ## run app with docker
	docker run -it --rm -p 8080:8080 tasks:latest