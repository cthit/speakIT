FROM node as builder

COPY . .

RUN npm install
RUN npm run build



FROM gesellix/caddy
COPY --from=builder /build .
COPY Caddyfile .
