FROM node:10

WORKDIR /usr/src/github

COPY package*.json /usr/src/github

RUN yarn install

COPY . /usr/src/github

EXPOSE 3000

CMD ["yarn", "start" ]
