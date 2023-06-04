FROM node
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx svelte-kit sync
RUN npm run build

EXPOSE 8888
CMD npm run node
