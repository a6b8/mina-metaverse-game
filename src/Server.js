const fs = require( 'fs' )
const moment = require( 'moment' )
const { isReady, PrivateKey, Field, Signature } = require( 'snarkyjs' )

const Server = class Server {
    constructor() {
        this.config = {
            'env': '.env',
            'environment': {
                'current': null,
                'url': {
                    'current': null,
                    'local': 'https://9ac2-2001-9e8-150f-3300-b563-8c55-4dbc-29d7.ngrok.io',
                    'heroku': '...'
                }
            },
            'console': {
                'symbols': {
                    'neutral': '⬛',
                    'onProgress1': '🔄',
                    'onProgress2': '🔥',
                    'ok1': '🟩',
                    'ok2': '🟪',
                    'split': '',
                    'failed': '❌'
                }
            },
            'server': {
                'port': 3000,
                'routes': [ 'polygon', 'binance', 'fantom' ],
                'publicFolder': './public',
            },
            'websocket': {
                'intervalInMs': 1000,
                'channels': {
                    'pingStandings': {
                        'name': 'pingStandings'
                    },
                    'pingObjects': {
                        'name': 'pingObjects'
                    }
                },
                'handshake': [ 
                    'handshake123'
                ]
            },
            'objects': {
                'maxSize': 40,
                'bounding': {
                    'x': {
                        'start': -640,
                        'end': 630
                    },
                    'y': {
                        'start': 630,
                        'end': -640
                    }
                },
                'refreshTimeInSeconds': 60 
            },
            'user': {
                'points': 2
            }
        }

        this.mina = {}

        
        this.config['environment']['current'] = process.argv.length == 2 ? 'local' : 'heroku'

        if( this.config['environment']['current'] === 'local' ) {
        } else {
            this.config['server']['port'] = process.env.PORT
        }

        this.config['environment']['url']['current'] = 
            this.config['environment']['url'][ this.config['environment']['current'] ]

        this.state  = {
            'blocknumber': {},
            'tick': {
                'txt': [],
                'cmds': []
            },
            'streams': [],
            'points': [],
            'users': {},
            'progress': {
                'ping': 0,
                'objects': 0
            }
        }

        this.state['blocknumber'] = this.config['server']['routes']
            .reduce( ( acc, a ) => { 
                acc[ a ] = 0
                return acc
            }, {} )
    }


    async init( silent=false ) {
        this.express = require( 'express' )
        this.app = this.express()
        this.points = this.createObjects()

        // this.Moralis = require('moralis' ).default
        
        this.http = require( 'http' ).Server( this.app )
        this.io = require( 'socket.io' )( this.http )

        // this.tickTock = new TickTock()
        // this.tickTock.init( { 'firstState': this.state['points'] } )

        this.silent = silent
        this.addMina()

        this.ping = {
            'newPoints': false
        }
    }


    addMina() {
        !this.silent ? console.log( ' - Add Mina .env' ) : ''

        switch( this.config['environment']['current'] ) {
            case 'heroku':
                this.mina = {
                    'MINA_SERVER_PUBLIC': process.env.MINA_SERVER_PUBLIC,
                    'MINA_SERVER_PRIVATE': process.env.MINA_SERVER_PRIVATE
                }
                break
            case 'local':
                const env = fs.readFileSync( this.config['env'], 'utf-8' )
                    .split( "\n" )
                    .reduce( ( acc, row, index ) => {
                        let [ key, value ] = row.split( /=(.+)/ )
                        acc[ key ] = ( value + '' ).trim()
                        return acc
                    }, {} ) 
        
                this.mina = env
                break
            default:
                console.log( 'Wrong environment!' )
                process.exit( 1 )
                break
        }


        return true
    }


    mapValues( { value, v1, v2, v3, v4, bounding=false, swapValues=false } ) {
        // console.log( `AAA ${value}, ${v1}, ${v2}, ${v3}, ${v4}`)
        let result = ( value - v1 ) / ( v2 - v1 ) * ( v4 - v3 ) + v3


        if( bounding ) {
            const nums = [ v3, v4 ]
            const min = Math.min( ...nums )
            const max = Math.max( ...nums )
    
            if( result < min ) {
                result = !swapValues ? v3 : v4
            } else if( result > max ) {
                result = !swapValues ? v4 : v3
            }
        }

        return result
    }


    createObjects() {
        this.state['points'] = new Array( this.config['objects']['maxSize'] )
            .fill( '' )
            .map( ( a, index ) => {
                const struct = {
                    'id': `server__${index}`,
                    'x': null,
                    'y': null,
                    'data': null,
                    'status': 'active',
                    'chain': null,
                    'unix': moment().unix()
                }

                const range = {
                    'from': 0,
                    'to': 2
                }

                struct['chain'] = this.config['server']['routes'][ 
                    Math.floor( Math.random() * ( range['to'] - range['from'] + 1 ) + range['from'] )
                ]

                const z = [ 'x', 'y' ]
                    .forEach( pos => {
                        const value = Math.random()
                        // console.log( `value: ${pos}, ${value}, ${this.config['objects']['bounding'][ pos ]['from']}` )
                        struct[ pos ] = this.mapValues( { 
                            'value': value, 
                            'v1': 0, 
                            'v2': 1, 
                            'v3': this.config['objects']['bounding'][ pos ]['start'], 
                            'v4': this.config['objects']['bounding'][ pos ]['end'],
                            'bounding': false, 
                            'swapValues': false 
                        } )
                    } )

                return struct
            } )
        // console.log( this.state['points'] )
        return true
    }


    expressAddStream( { route, res, req } ) {
        const { headers, body } = req
                
        try {
            this.Moralis.Streams.verifySignature( {
                body,
                'signature': headers['x-signature']
            } )


            if( body.block.number && ( Number( body.block.number ) > this.state['blocknumber'][ route ] ) ) {
                this.state['blocknumber'][ route ] = Number( body.block.number )
            }else {
                return res.status( 200 ).json()
            } 

            !this.silent ? console.log( `${route} (Block: ${this.state['blocknumber'][ route ]})` ) : ''

/*
            const datas = body['nftTransfers']
                .map( ( a, index ) => {
                    const address = `${a['to'].slice( 0, 4 )}...${a['to'].slice( 38 ) }`
                    const txt = ` - [${index}]  ${address} just received ${a['tokenName']} (${a['tokenId']})`

                    const cmd = {
                        'txt': txt,
                        'chain': route,
                        'contract': a['contract'],
                        'tokenId': a['tokenId']
                    }

                    return cmd
                } )

            fs.writeFileSync( 'transfer.json', JSON.stringify( body, null, 4 ) )
*/

            // this.tickTock.setData( { 'datas': body } )

            return res.status( 200 ).json()
        } catch ( e ) {
            console.log( 'Can not verify Moralis Request.' )
            return res.status( 400 ).json()
        }
    }


    addExpress() {
        !this.silent ? console.log( ' - Add Express' ) : ''

        const id = '123456789'
        const html = fs.readFileSync( `${this.config['server']['publicFolder']}/index.html`, 'utf-8' )
            .replace( '<script>const serverId=null</script>', `<script>const serverId='${id}'</script>`)

        this.app.get( 
            `/index.html`, 
            ( req, res ) => res.send( html ) 
        )

        this.app.use(
            this.express.json()
        ) 
/*
        this.app.use(function (req, res, next) {
             res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
             res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            next()
        });
*/
        
        this.app.post( 
            `/found/:objectId/:userId`, 
            ( req, res ) => {
                const userId = req.params.userId
                const objectId = req.params.objectId

                console.log( 'objectId', objectId )
                console.log( 'userId', userId )
                // console.log( 'userId', req.params.userId )
                // console.log( 'objectId', req.params.objectId )

                let points = null
                let message = []
                if( this.state['users'].hasOwnProperty( userId ) ) {
                    message.push( 'User found' )
                    const search = this.state['points']
                        .filter( a => a['id'] === objectId )
                    if( search.length > 0 ) {
                        const index = this.state['points']
                            .findIndex( a => a['id'] === objectId )
                            if( this.state['points'][ index ]['status'] !== 'found' ) {
                                this.state['points'][ index ]['status'] = 'found'
                                this.state['points'][ index ]['unix'] = moment().unix()
                                this.state['users'][ userId ]['points'] = this.state['users'][ userId ]['points'] + this.config['user']['points']

                                this.ping['newPoints'] = true
                                points = this.state['users'][ userId ]['points']
                                message.push( '🎉 Succesful changed')
                            } else {
                                message.push( 'Object was found before' )
                            }
                        message.push( 'Req found' )
                    } else {
                        message.push( 'Object not found.' )
                    }
                } else {
                    message.push( 'Wrong userId.' )
                }

                res.send( { 'data': message, 'points': points } )
            }
        )

        this.app
            .route( `/challenge/:userId` )
            .get( ( req, res ) => {
                const { userId } = req.params
                // console.log( 'userId', userId )
                // console.log( '>>>', this.state['users'][ userId ] )

                let body = {}
                if( this.state['users'][ userId ] !== undefined ) {
                    if( this.state['users'][ userId ]['seed'] !== null ) {
                        // console.log( 'Test' )
                        // return res.send( body )
                    }

                    const randomNumber = ( min, max ) => Math.floor( Math.random() * ( max - min + 1 ) + min )
                    const seed = randomNumber( 100_000_000, 999_000_000 ) 
                    this.state['users'][ userId ]['seed'] = seed

                    const tmp = { ...this.state['users'][ userId ], userId }
                    body = JSON.stringify( tmp )
                }

                res.send( body )
            } )

        this.app
            .route( `/challenge/:seed` )
            .post( ( req, res ) => {
                let { seed } = req.params

                /* --> 
                    challenge signature verification here
                <-- */

                const test = Object
                    .entries( this.state['users'] )
                    .filter( a => a[ 1 ]['seed'] === parseInt( seed ) )

                let userId
                if( test.length === 0 ) {
                    return res.send( { 'error': 'seed not found' } )
                } else {
                    userId = test[ 0 ][ 0 ]
                }

                const userInput = {
                    'input': {
                        'id': this.state['users'][ userId ]['number'],
                        'points': this.state['users'][ userId ]['points']
                    }
                }

                const minaPrivateKey = PrivateKey
                    .fromBase58( this.mina['MINA_SERVER_PRIVATE'] )

                const minaInputFields = Object
                    .entries( userInput['input'] ) 
                    .map( a => Field( a[ 1 ] ) )

                const signature = Signature
                    .create(
                        minaPrivateKey, 
                        minaInputFields
                    )

                const result = {
                    'userId': userId,
                    'data': userInput['input'],
                    'signature': signature,
                    'publicKey': this.mina['MINA_SERVER_PUBLIC'],
                    'seed': this.state['users'][ userId ]['seed']
                }

                return res.send( result )
            } )

        this.app.use( 
            this.express.static( this.config['server']['publicFolder'] )
        )

        this.app.use( this.express.json() )
        
        this.config['server']['routes']
            .forEach( ( route, index ) => {
                index === 0 ? this.state['blocknumber'][ route ] = 0 : ''
                this.app.post( 
                    `/${route}`, 
                    ( req, res ) => this.expressAddStream( { route, res, req } ) 
                )
            } )
    

        this.app.get( 
            `/getStandings`, 
            ( req, res ) => {
                const standings = Object
                    .entries( this.state['users'] )
                    .sort( ( a, b ) => a[ 1 ]['points'] - b[ 1 ]['points'])
                    .map( a => {
                        const struct = {
                            'id': a[ 0 ],
                            'userName': a[ 1 ]['userName'],
                            'cryptoAddress': a[ 1 ]['cryptoAddress'],
                            'cryptoChain': a[ 1 ]['cryptoChain'],
                            'points': a[ 1 ]['points'],
                            'seed': a[ 1 ]['seed']
                        }
                        return struct
                    } )

                res.json({ 'data': standings } )
            } 
        )

        this.app.post(
            '/getObjects',
            ( req, res ) => {
                try {
                    const json = JSON.parse( JSON.stringify( req.body ) )
                    console.log( 'req', req.body )
                    console.log( 'json', json )
                    if( json.hasOwnProperty( 'ids' ) ) {
                        const data = this.state['points']
                            .filter( a => json.ids.includes( a['id'] ) )
                            .reduce( ( acc, item, index ) => {
                                index === 0 ? acc['message'] = 'ok' : ''
                                index === 0 ? acc['data'] = [] : ''
                                index === 0 ? acc['progress'] = this.state['progress']['ping'] : ''
                                acc['data'].push( item )
                                return acc
                            }, {} )

                        res.json( data )
                    } else {
                        res.json( {
                            'message': 'key "ids" not found' 
                        } )
                    }
                } catch( e ) {
                    console.log( e )
                    res.json( {
                        'message': 'error' 
                    })
                }
            }
        )

        this.app.get( 
            `/getObjectsAll`, 
            ( req, res ) => {
                const data = this.state['points']
                    .reduce( ( acc, item, index ) => {
                        index === 0 ? acc['data'] = [] : ''
                        index === 0 ? acc['progress'] = this.state['progress']['ping'] : ''
                        acc['data'].push( item )
                        return acc
                    }, {} )
                res.json( data )
            } 
        )
    }


    pingStandings() {
        this.io.emit( 
            this.config['websocket']['channels']['pingStandings']['name'], 
            this.state['progress']['ping']
        )

        this.state['progress']['ping']++
    }


    pingObjects( { activate=[], deactivate=[] } ) {
        const cmds = []

        activate
            .forEach( id => {
                const struct = this.state['points']
                    .find( b => b['id'] === id )
                const result = {
                    'id': struct['id'],
                    'chain': struct['chain'],
                    'type': 'activate'
                }
                cmds.push( result )
                return result
            } )

        deactivate
            .forEach( id => {
                const struct = this.state['points']
                    .find( b => b['id'] === id )
                const result = {
                    'id': struct['id'],
                    'chain': struct['chain'],
                    'type': 'deactivate'
                }

                cmds.push( result )
                return result
            } )

        this.io.emit(
            this.config['websocket']['channels']['pingObjects']['name'], 
            { 'cmds': cmds }
        )

        this.state['points']
            .forEach( ( item, index ) => {
                if( activate.includes( item['id'] ) ) {
                    this.state['points'][ index ]['status'] = 'active' 
                    this.state['points'][ index ]['unix'] = moment().unix()
                }

                if( deactivate.includes( item['id'] ) ) {
                    this.state['points'][ index ]['status'] = 'found' 
                    this.state['points'][ index ]['unix'] = moment().unix()
                }
            } )
        
        this.state['progress']['objects']++
    } 


    addWebsocket() {
        function checkHandshake( { socket, fromServer } ) {
            const fromUser = socket.handshake.query.handshake
            const keys = Object.keys( socket.handshake.query )
            const tests = [
                keys.includes( 'userName' ),
                keys.includes( 'cryptoAddress' ),
                keys.includes( 'cryptoChain' ),
                keys.includes( 'handshake' )
            ]
                .every( a => a === true )

            if( tests ) {
                if( socket.handshake.query.handshake.includes( fromUser ) ) {
                    return true
                } else {
                    console.log( `Unknown User` )
                    return false
                }
            }
        }


        !this.silent ? console.log( ' - Add Websocket' ) : ''

        this.io.on( 
            'connection', 
            ( socket ) => {
                const id = socket['client']['id']
                const handshake = this.config['websocket']['handshake']

                if( checkHandshake( { socket, 'fromServer': handshake } ) ) {
                    const unix = moment().unix()
                    const userName = socket.handshake.query.userName
                    const cryptoAddress = socket.handshake.query.cryptoAddress
                    const cryptoChain = socket.handshake.query.cryptoChain



                    this.state['users'][ id ] = {
                        'number': Object.keys( this.state['users'] ).length,
                        'created': unix,
                        'updated': unix,
                        'points': 0,
                        'userName': userName,
                        'cryptoAddress': cryptoAddress,
                        'cryptoChain': cryptoChain,
                        'seed': null
                    }

                    this.pingStandings()

                    console.log( `${this.config['console']['symbols']['ok1']} New User    | ${userName} (${id}) | ${Object.keys( this.state['users'] ).length }` )
                } else {
                    socket.disconnect()
                    delete this.state['users'][ id ]
                    console.log( `${this.config['console']['symbols']['failed']} Handshake not successful | ${id} | (${Object.keys( this.state['users'] ).length })` )
                }


                socket.on( 'disconnect', () => {
                    const userName = this.state['users'][ id ]['userName']
                    delete this.state['users'][ id ]
                    this.pingStandings()
                    
                    console.log( `${this.config['console']['symbols']['onProgress2']} Delete User | ${userName} (${id}) | ${Object.keys( this.state['users'] ).length }` )

                } )

                socket.on('reconnect', ()=>{
                    //Your Code Here
                    console.log( 'reconnect' )
                });



                // this.checkHandshake()

/*
                if( !this.state['users'].hasOwnProperty( id ) ) {

                    const unix = moment().unix()
                    this.state['users'][ id ] = {
                        'created': unix,
                        'updated': unix
                    }
                    console.log( `${this.config['console']['symbols']['ok1']} New Connection - ${id} (${Object.keys( this.state['users'] ).length })` )
                } else {
                    console.log( 'Double connection' )
                }

                socket.on(
                    'ping', 
                    ( client_id ) => {
                        console.log( `ping -> id: ${id}` )
                        if( !this.state['users'].hasOwnProperty( id ) ) {
                            const unix = moment().unix()
                            this.state['users'][ id ]['updated'] = unix
                            // console.log( `${this.config['console']['symbols']['ok1']} New Connection - ${id} (${Object.keys( this.state['users'] ).length })` )
                        } else {
                            console.log( 'Connection not known' )
                        }
                    } 
                )

                socket.on('disconnect', () => {
                    delete this.state['users'][ id ]
                    console.log( `${this.config['console']['symbols']['error']} Delete Connection (${id})` )
                    console.log( `> ${Object.keys( this.state['users'].lengths )}` )
                })
*/

            } 
        )


        this.io.on( 'disconnection', ( socket ) => {
            console.log( 'lost connection')
        } )
    }


    addStreamCleanUp() {
        [ 
            // `exit`, 
            `SIGINT`,
            // `SIGUSR1`,
            // `SIGUSR2`,
            // `uncaughtException`,
            // `SIGTERM` 
        ]
            .forEach( ( eventType ) => {
                process.on( eventType, async() => { 
                    // console.log( `Clean Up Moralis ${eventType}` )
                    if( this.config['moralis']['use'] ) {
                        await this.moralisChangeStatus( { 'position': 'end' } )
                    }
                    
                    process.exit( 1 )
                } )
            } )
    }


    addInterval() {
        const interval = setInterval( 
            async() => {

                if( this.ping['newPoints'] ) {
                    this.ping['newPoints'] = false
                    this.pingStandings() 
                }

                const now = moment().unix()
                const us = this.state['points']
                    .filter( a => a['status'] === 'found' ) 
                    .filter( a => {
                        const calc = now - a['unix']
                        if( calc > this.config['objects']['refreshTimeInSeconds'] ) {
                            return true
                        } else {
                            return false
                        }
                    } )

                if( us.length > 0 ) {
                    this.pingObjects( { 
                        'activate': us.map( a => a['id'] )
                    } ) 
                }

                // console.log( 'HERE',  this.socket.eventNames() )

                /*
                console.log( this.tickTock.state )

                this.tickTock.state
                    .forEach( a => {
                        this.io.emit( 
                            this.config['websocket']['channels']['chat']['name'], 
                            a['code'] 
                        )
                    } )

                this.tickTock.clearData()
                */
            }, 
            this.config['websocket']['intervalInMs'] 
        )
    }


    setStateStream() {
        !this.silent ? console.log( ' - Set Stream Options') : ''
        this.state['streams'] = this.config['moralis']['streams']
            .map( ( a, index ) => {
                const options = JSON.parse( 
                    JSON.stringify( 
                        this.config['moralis']['options']
                    ) 
                )

                const struct = {
                    'name': a['route'],
                    'moralisApiKey': this.config['moralis']['key'],
                    'path': a['path'],
                    'maxSize': a['maxSize'],
                    'delay': a['delay'],
                    'options': options
                }

                struct['options']['chains'] = a['chains']
                struct['options']['webhookUrl'] = a['webhookUrl']

                return struct
            } )

        return true
    }


    async addStream( { cmd } ) {
        const stream = await this.Moralis.Streams.add( cmd['options'] )
        const polygon = JSON.parse( fs.readFileSync( cmd['path'], 'utf-8' ) )
    
        const addresses = polygon['data']
            .filter( ( a, index ) => { return a['rank'] < cmd['maxSize'] ? true : false } )
            .map( a => a['address'] )
    
        addresses
            .forEach( ( a, i ) => {
                const space = new Array( 8 - ( i + '' ).length )
                    .fill( ' ' )
                    .join( '' )
                !this.silent ? console.log( `   [${i}]${space}${addresses[i]}` ) : ''
            } )

        const response = await this.Moralis.Streams.addAddress( {
            'id': stream['data']['id'],
            'address': addresses
        } )

        return response
    }


    async addStreams() {
        const delay = ms => new Promise( resolve => setTimeout( resolve, ms ) )

        !this.silent ? console.log( ' - Create Streams') : ''

        const streams = {
            'data': []
        }

        for( let i = 0; i < this.state['streams'].length; i++ ) {
            const cmd = this.state['streams'][ i ]
            !this.silent ? console.log( ` - ${cmd['name']}` ) : ''
    
            delay( cmd['delay'] )
            const response = await this.addStream( { cmd } )

            const stream = {
                'route': cmd['name'],
                'streamId': response['data']['streamId'],
                'webhookUrl': cmd['options']['webhookUrl']
            }

            !this.silent ? console.log( `   > ${stream['streamId']}` ) : ''

            streams['data'].push( stream )
        }

        fs.writeFileSync( 'streams.json', JSON.stringify( streams, null, 4 ), 'utf-8' ) 
        streams['data']
            .forEach( a => {
                const index = this.config['moralis']['streams']
                    .findIndex( b => b['route'] === a['route'] )
                
                this.config['moralis']['streams'][ index ]['id'] = a['streamId']
            } )
    }


    async start( { createStream=false } ) {
        !this.silent ? console.log( `> ${this.config['environment']['url']['current']}` ) : ''
        !this.silent ? console.log( 'Init Server' ) : ''

        await isReady
        // 
        this.addExpress()
        this.addInterval()
        this.addWebsocket()
        this.addStreamCleanUp()
        // this.tickTock.addInterval()

        !this.silent ? console.log( 'Start Server' ) : ''

        const root = this.config['environment']['url'][ this.config['environment']['current'] ]
        this.http.listen( 
            this.config['server']['port'], 
            async() => {
                if( createStream ) {
                    this.setStateStream()
                    await this.addStreams()
                }

                // await this.moralisChangeStatus( { 'position': 'begin' } )
/*
                
                console.log( ` - Listening at` )
                console.log( `   ${root}:${this.config['server']['port']}/` )

                this.config['moralis']['streams']
                    .forEach( a => { console.log( `   ${a['webhookUrl']}` ) } )
*/

            } 
        )

        return true
    }
}

module.exports = Server