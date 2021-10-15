# Contributing

Thank you for your interest in contributing to this extension! This project is still in develpment and welcomes contributions and suggestions.

## Setup environment

1. Install node 14.x
```bash
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs gcc g++ make
npm install -g vsce
```

## Build and Run

If you want explore the source code of this extension yourself, it's easy to get started. Simply follow these steps:

1. Clone the repository
1. `npm run compile`  
    The 2 following commands are run internally:
    1. `npm install`
    1. `./node_modules/.bin/electron-rebuild`
1. Run from vscode with `F5` to start debugging

Pkcs11 Explorer view should be shown in Explorer.