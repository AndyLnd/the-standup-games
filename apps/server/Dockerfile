FROM node:18-alpine
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY ./apps/server/package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY ./apps/server/ /usr/src/app/
ENV NODE_ENV production
ENV PORT 443
RUN npm run build
EXPOSE 443
CMD [ "npm", "start" ]