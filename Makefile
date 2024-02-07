# PHONY explained: https://www.gnu.org/software/make/manual/html_node/Phony-Targets.html
.PHONY: local-db/start local-db/stop

## Local scripts
local-db/start:
	docker run --name tripwire-pg -p 5432:5432 --env POSTGRES_USER=postgres --env POSTGRES_PASSWORD=password --env POSTGRES_DB=tripwire --env POSTGRES_HOST_AUTH_METHOD=trust -d postgres:13

local-db/stop:
	docker stop tripwire-pg && docker rm tripwire-pg