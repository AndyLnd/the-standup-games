FROM node:18-alpine
RUN apk add git
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/
COPY ./ /usr/src/app/
RUN npm install && npm cache clean --force
ENV NODE_ENV production
ENV PORT 80
ENV PORT_WS 443
ENV VITE_PORT_WS 443
RUN npm run build
EXPOSE 443
CMD node apps/server/build/index.js