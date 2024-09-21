FROM node:21.7.3

RUN useradd -ms /bin/bash api
# /home/api \

WORKDIR /home/api

COPY package*.json /home/api/

RUN corepack enable pnpm

RUN pnpm install

COPY . .

USER api

EXPOSE 5001

CMD ["pnpm", "start"]