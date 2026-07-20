.PHONY: handoff changelog log update help

handoff: ## Edit the handoff document
	@vim docs/HANDOFF.md

changelog: ## Edit the changelog
	@vim docs/CHANGELOG.md

update: handoff changelog ## Edit both handoff and changelog (handoff first)

log: ## Append an entry to the Unreleased section of CHANGELOG
	@echo "Paste your entry (e.g. '- Fixed login crash'):"
	@read -r entry; \
	sed -i "/^## Unreleased/a $$entry" docs/CHANGELOG.md; \
	echo "Added: $$entry"

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
