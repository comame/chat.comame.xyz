FROM node:alpine

WORKDIR /home/node/app

COPY ./package.json /home/node/app/package.json
COPY ./package-lock.json /home/node/app/package-lock.json
RUN npm ci

COPY . /home/node/app/
RUN npm run build

CMD npm run start
