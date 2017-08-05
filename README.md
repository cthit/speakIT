# talarlista
[![CircleCI](https://circleci.com/gh/Tejpbit/talarlista/tree/develop.svg?style=svg)](https://circleci.com/gh/Tejpbit/talarlista/tree/develop)

## Project setup
Make sure you have golang updated and your $GOPATH set.
```
git clone https://github.com/tejpbit/talarlista $GOPATH/src/github.com/tejpbit/talarlista # I know this is dirty, should use go get but that doesn't work while the go project isn't in the root of the project.
cd $GOPATH/src/github.com/tejpbit/talarlista
(cd backend; go get -d) #parenthesis for subshell, then download deps
(cd frontend; yarn)

# Running backend
(cd backend; go run main.go)

# Runnig frontend
(cd frontend; yarn start)

```
