FROM node:10

WORKDIR ./app

COPY package*.json ./app

RUN tyarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start" ]
