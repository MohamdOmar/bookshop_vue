# Bookshop Getting Started Sample

This is our primer sample for [Getting Started in a Nutshell](https://cap.cloud.sap/docs/get-started/in-a-nutshell).


## Get and Run

  Assumed you've `@sap/cds-dk` [installed globally](https://cap.cloud.sap/docs/get-started):

  ```sh
  git clone https://github.com/capire/bookshop
  cds watch bookshop
  ```
  > then open http://localhost:4004 (Cmd/Ctrl+click on the link in the log output)


## Develop

  Assumed you use VS Code with CLI command enabled
  
  ```sh
  code bookshop
  ```


## Reuse

Add this to your local or global `.npmrc`:

```properties
@capire:registry=https://npm.pkg.github.com/
```

Then install bookshop using `npm` as usual:

```sh
npm add @capire/bookshop
```
