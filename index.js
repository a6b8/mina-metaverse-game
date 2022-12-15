const Server = require( './src/Server.js' )

async function main() {
    const server = new Server()
    await server.init()
    await server.start( { 'createStream': false } )
    
    return true
}


main()
    .then( a => '' )
    .catch( e => console.log( e ) )





    
