# Development image. Source is bind-mounted by docker-compose; node_modules
# is a named volume so platform-specific binaries (esbuild, sass-embedded)
# are installed for Linux, not copied from the host.
FROM node:22-slim

WORKDIR /app

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
