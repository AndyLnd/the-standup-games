FROM node:18-alpine
RUN apk add git
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY ./ /usr/src/app/
ENV NODE_ENV production
ENV PORT 80
ENV PORT_WS 443
ENV VITE_PORT_WS 443
RUN npm run build
EXPOSE 80 443
CMD [ "npm", "start" ]