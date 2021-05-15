# speakIT
[![CircleCI](https://circleci.com/gh/cthit/speakIT/tree/develop.svg?style=svg)](https://circleci.com/gh/cthit/speakIT/tree/develop)

## Setup a development enviroment for SpeakIT
### Install a new virtual machine with Ubuntu

Download virtualbox for your current OS
https://www.virtualbox.org/wiki/Downloads

Download the latest Ubuntu LTS .iso image from
https://ubuntu.com/download/desktop

Now create a new virtual machine and install ubuntu, google if you
need futher instructions.
### Log into the machine

First lets update the machine.
```
$ sudo apt update
$ sudo apt upgrade
```
The machine might need a restart after this.

The machine is missing some of our dependencies so let's install them.
### Install git
`$ sudo apt install git`

### Install any decent editor, e.g. vscode or emacs

Go to https://code.visualstudio.com/docs/setup/linux and 
download the .deb package install it via the command

`$ cd ~/Downloads && sudo apt install ./<file>.deb`

Now you should be able to search for and open vscode in your VM.

### Now we are going to install our other dependecnies
The frontend part of SpeakIT is built with yarn, the easiest way to 
install is via the node pakcage manager, so install npm 
first using:

`$ sudo apt install npm`

Ather this we can install yarn with npm

`$ sudo npm install --global yarn`

The backend is built with go so lets install go with the instructions at https://golang.org/doc/install

1. Download the tar-ball "Download go for linux"
2. Extract the archive you downloaded into /usr/local, creating a Go tree in /usr/local/go using the following command

`$ sudo tar -C /usr/local -xzf go1.16.4.linux-amd64.tar.gz`

4. Edit your .profile file in your home directory and add the following line to the end of that file

`export PATH=$PATH:/usr/local/go/bin`

5. From your terminal run the following command `$ source ~/.profile`

6. Now `$ go version` should return the version you just installed

SpeakIT can also use docker and docker-compose for development so lets install them.

`$ sudo apt install docker-compose`

# Clone the repo and build/run
First we need to set a GOPATH variable, e.g. you could set it in a directory called `go` in your home directory:

```
$ cd ~
$ mkdir go
```
Now set the variable in your .profile by adding the following line

`export GOPATH=~/go`

And run the following command:

`$ source ~/.profile`

Now we clone our repo into our GOPATH-directory

`$ git clone https://github.com/cthit/speakIT $GOPATH/src/github.com/cthit/speakIT`

Since SpeakIT started before go modules you need to modify go to be able to build 
the backend without complaining. This can be done with the following command.
`$ go env -w GO111MODULE=auto`

Now run the following the download the rest of the dependencies
```
$ cd $GOPATH/src/github.com/cthit/speakIT
$ (cd backend; go get -d)
$ (cd frontend; yarn)
```

When this is done the application can be started
* Running backend
`$ (cd backend; go install) && $GOPATH/bin/backend`
* Runnig frontend
`$ (cd frontend; yarn start)`
