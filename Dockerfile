FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js ./

RUN npm install

EXPOSE 5001

CMD [ "node", "index.js" ]
