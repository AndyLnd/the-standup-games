FROM node:18-alpine
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY .apps/client/package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY .apps/client/ /usr/src/app/
ENV NODE_ENV production
ENV PORT 80
RUN npm run build
EXPOSE 80
CMD [ "npm", "start" ]