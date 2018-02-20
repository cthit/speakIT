FROM golang

COPY . /go/src/github.com/tejpbit/talarlista/backend

RUN go get github.com/tejpbit/talarlista/backend
RUN go install github.com/tejpbit/talarlista/backend

ENTRYPOINT /go/bin/backend

EXPOSE 3000