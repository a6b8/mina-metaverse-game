const fs = require( 'fs' )


const Convert = class Convert {
    constructor() {
        this.config = {
            'output': '0-results/'
        }
    }


    async start( { data } ) {
        console.log( data )
    }


    save() {
        fs.mkdirSync( 
            this.config['output'], 
            { recursive: true }
        )
    }
}




async function main() {
    const data = fs.readFileSync( '../assets/heightmap.png' )
    const convert = new Convert()
    //await convert.start( { data } )

}


main()
    .then( a => console.log( a ) )
    .catch( e => console.log( e ) )