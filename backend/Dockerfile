FROM golang as builder

COPY . /go/src/github.com/cthit/speakIT/backend

RUN go get github.com/cthit/speakIT/backend
#RUN go install github.com/cthit/speakIT/backend

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /main /go/src/github.com/cthit/speakIT/backend/*.go



FROM scratch
COPY --from=builder /main /

EXPOSE 3000
CMD ["/main"]