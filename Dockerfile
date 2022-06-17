FROM node:18-alpine
RUN apk add git
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY ./ /usr/src/app/
RUN npm install && npm cache clean --force
ENV NODE_ENV production
ENV PORT 80
ENV PORT_WS 2567
ENV VITE_PORT_WS 2567
RUN npm run build
EXPOSE 80 2567
CMD [ "npm", "start" ]