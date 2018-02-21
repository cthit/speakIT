FROM alpine as builder

RUN apk update
RUN apk add yarn


COPY . .

RUN yarn install
RUN yarn build



FROM gesellix/caddy
COPY --from=builder /build .
COPY Caddyfile /
