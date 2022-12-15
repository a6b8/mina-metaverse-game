class WalletMina {
    constructor() {
        this.config = {
            'regex': /^B62[a-zA-Z0-9]{52}$/g,
            'style': {
                'button': {
                    'inactive': {
                        'text': 'MINA',
                        'background': 'lightgrey',
                        'textColor': 'grey'
                    },
                    'active': {
                        'text': 'START',
                        'background': '#0C0725',
                        'textColor': '#F3B2AB'
                    }
                }
            },
            'domId': 'mina',

            'dom': {
                'button': 'mina_button',
                'start': 'metaverse_start'
            },

            'offset': {
                'x': 0,
                'y': 0
            },
            'data': './mina-reward/'
        }

        this.state = {
            'available': false,
            'account': null,
            'eligibleForReward': true,
            'status': 'untouched'
        }

        return this
    }


    async init() {
        this.isAvailable()
        this.dom = document.getElementById( this.config['domId'] )
        /*
            if( !window.mina ) {
                alert( 'No provider was found Auro Wallet' )
            } else {
                    console.log( 'Onboarding in progress' )
                    let data = await window.mina.requestAccounts().catch( err => err )
                if( data.message !== undefined ) {
                    console.log( data.message )
                } else{
                    let approveAccount = data
                    let account = approveAccount
                    console.log( `Account: ${approveAccount}`)
                }
            }
        */
    }


    isAvailable() {
        if( window.mina ) {
            this.state['available'] = true
            console.log( 'Auro Wallet available')
        } else {
            console.log( 'Auro Wallet not available')
        }
    }


    isReady() {
        return ( ( this.state['account'] !== null ) && ( this.state['available'] === true ) )
    }


    styleButton( { mode, disable } ) {
        document.getElementById( this.config['dom']['start'] ).disabled = disable

        document.getElementById( this.config['dom']['start'] ).innerHTML = 
            this.config['style']['button'][ mode ]['text']
        document.getElementById( this.config['dom']['start'] ).style.background = 
            this.config['style']['button'][ mode ]['background']
        document.getElementById( this.config['dom']['start'] ).style.color = 
            this.config['style']['button'][ mode ]['textColor']
    }


    async accountConnect() {
        let account
        if( this.state['available'] ) {
            account = window.mina.requestAccounts()
            this.styleButton( { 
                'mode': 'inactive', 
                'disable': true 
            } )
        }

        return account
    }


    async accountResponse( response ) {
        console.log( 'response', response )
        if( response.length > 0 ) {
            if( response[ 0 ].match( this.config['regex'] ).length > 0 ) {
                this.state['account'] = response[ 0 ]
                this.styleButton( { 
                    'mode': 'active', 
                    'disable': false
                } )
            } else {
                console.log( 'Wrong Mina Address' )
            }
        }

        metaverse.withUserName( { 
            'userName': document.getElementById('user_name' ).value, 
            'cryptoAddress': this.state['account'], 
            'cryptoChain': 'mina'
        } )
    }


    createBoard() {
        if( !this.isReady() ) { return true } 
        this.resizeWindow()
        this.updateBoard()
        this.dom
        this.addEventListener()
    }


    addEventListener() {
        let signResult
        let result
    }


    rewardClaim() {
        let message = ''
        message += 'CLAIN YOUR REWARD, '
        message += `${metaverse.state['user']['userName']}, `
        message += `${metaverse.state['socket']['userId']}, `
        message += `${metaverse.state['user']['points']} points`

        window.mina.signMessage( {message: "test",} )
            .then( a => {
                this.state['status'] = 'inProgress'

                console.log( response)
            } )
            .catch( e => console.log( e ) )

    }


    async generateReceipt() {
        function download( data, filename, type ) {
            var file = new Blob( 
                [ data ], 
                { 'type': type } 
            )
            if( window.navigator.msSaveOrOpenBlob ) 
                window.navigator.msSaveOrOpenBlob( file, filename )
            else {
                var a = document.createElement( 'a' )
                let url = URL.createObjectURL( file )
                a.href = url
                a.download = filename
                a.style.display = 'none'
                document.body.appendChild( a )
                a.click()
                setTimeout( 
                    () => {
                        document.body.removeChild( a )
                        window.URL.revokeObjectURL( url )  
                    }, 
                    0 
                ) 
            }
        }


        const url = `./challenge/${metaverse.state['socket']['userId']}`
        const response = await fetch( url )
        let rsp = await response.json()

        console.log( '>>>', rsp )

        let msg = `You reached 10 points, awesome! You are eligible to receive a proof 👽. ${rsp['seed']} `

        const mmm = await window.mina.signMessage( { 
            'message': msg 
        } )

        const signature = mmm['signature']

        const struct = {
            'publicKey': metaverse.state['user']['cryptoAddress'],
            'signature': signature,
            'payload': rsp
        }

        let response2
        try {
            response2 = await fetch( 
                `./challenge/${rsp['seed']}`,
                {
                    'method': 'POST',
                    'body': JSON.stringify( struct ),
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                }
            )

            response2 = await response2.json()
            let str = ''
            str += JSON.stringify( response2, null, 4 )

            var encodedString = btoa(str)
            let receipt = `data:application/json;base64,${encodedString}`
            console.log( receipt )

            navigator.clipboard.writeText( str )
           // alert( 'Copied your signature to your clipboard')
            // window.open( receipt, '_blank' )

            download( str, 'beta-tester-2022-12.json', 'text/json' )


        } catch( e ) {
            console.log( e )
        }

        return true
    }



    updateBoard() {
        if( !this.isReady() ) { return true }

        this.dom.innerHTML = this.drawMina()
        this.resizeWindow()

        return true
    }


    drawMina() {
        const str = `<button id="mina_button">MINA</button>`
        return str
    }


    resizeWindow() {
        const bounding = this.dom.getBoundingClientRect()
        const struct = {
            'window': {
                'x': window.innerWidth,
                'y': window.innerHeight
            },
            'bounding': {
                'x': bounding.width,
                'y': bounding.height
            },
            'translate': {
                'x': null,
                'y': null
            }
        }

        struct['translate']['x'] =  struct['window']['x'] - struct['bounding']['x']

        this.dom.style.left = `${this.config['offset']['x']}px` 
        this.dom.style.top = `${this.config['offset']['y']}px` 
    }
}


class Standings {
    constructor() {
        this.config = {
            'user': {
                'symbol': '👩‍🚀'
            },
            'dom': {
                'id': 'standings',
                'show': true
            },
            'row': {
                'maxLength': {
                    'id': 6,
                    'name': 13,
                    'points': 10
                },
                'splitter': '...',
            },
            'output': {
                'maxRows': 10,
                'splitter': '...',
                'title': 'RANKING',
                'newLine': "<br>",
                'whitespace': '&nbsp;'
            },
            'offset': {
                'x': 0,
                'y': 0
            }
        }

        this.str = ''
        this.example
        this.board = ''
        this.dom = null

        this.state = {
            'userId': null,
            'dataset': null
        }
    }


    init( { userId, dataset } ) {
        console.log( 'userId', userId )
        this.state['userId'] = userId
        this.state['dataset'] = dataset
        this.dom = document.getElementById( this.config['dom']['id'] )
        this.dom.style.position = 'absolute'
    }


    createBoard() {
        this.updateBoard( { 
            'dataset': this.state['dataset'] 
        } )
    }


    updateBoard( { dataset } ) {
        this.state['dataset'] = dataset
        this.board = this
            .setRankingWithLimit( {
                'userId': this.state['userId'], 
                'dataset': this.state['dataset']
            } )
            .addHeadline()
            .toString()

        this.dom.innerHTML = this.board
        this.resizeWindow()

        return true
    }


    toggleVisibility() {
        
        this.config['dom']['show'] = this.config['dom']['show'] ? false : true
        const cmd = [ 'hidden', 'visible' ]

        this.dom.style.visibility = cmd[ this.config['dom']['show'] ? 1 : 0 ]
    }


    resizeWindow() {
        const bounding = this.dom.getBoundingClientRect()
        const struct = {
            'window': {
                'x': window.innerWidth,
                'y': window.innerHeight
            },
            'bounding': {
                'x': bounding.width,
                'y': bounding.height
            },
            'translate': {
                'x': null,
                'y': null
            }
        }

        struct['translate']['x'] =  struct['window']['x'] - struct['bounding']['x']

        this.dom.style.left = `${struct['translate']['x'] - this.config['offset']['x']}px` 
        this.dom.style.top = `${this.config['offset']['y']}px` 
    }


    prepareList( { dataset } ) {
        const list = dataset['data']
            .reduce( ( acc, a, index ) => {
                const key = `${a['points']}`
        
                if( !acc.hasOwnProperty( key ) ) {
                    acc[ key ] = { 'users': [] }
                }
                acc[ key ]['users'].push( a )
                return acc
            }, {} )

        this.ranking = Object
            .keys( list )
            .map( a => parseInt( a ) )
            .sort( ( a, b ) => a - b )
            .reverse()
            .map( ( a, index ) => {
                const key = `${a}`
                return {
                    'points': key,
                    'users': list[ key ]['users']
                }
            } )
    }


    formatRow( { i, userId, index, rank, result, item, points } ) {
        let rank_str = ''
        if( index === 0 ) {
            const rank_space = new Array( this.config['row']['maxLength']['id'] - `${rank}`.length - 1 )
                .fill( this.config['output']['whitespace'] )
                .join( '' )
            rank_str = `<span>${rank}.</span>${rank_space}`
        } else {
            rank_str = new Array( this.config['row']['maxLength']['id'] )
                .fill( this.config['output']['whitespace'] )
                .join( '' )
        }

        let user = item['userName']
        if( user.length > this.config['row']['maxLength']['name'] ) {
            const start = user.substring( 0, ( this.config['row']['maxLength']['name'] - 3 ) / 2  )
            const end = user.substring( ( user.length - ( this.config['row']['maxLength']['name'] - 3 ) / 2 ) , user.length )
            user = `${start}${this.config['row']['splitter']}${end}`
        } else if( user.length < this.config['row']['maxLength']['name'] ) {
            const space = new Array( this.config['row']['maxLength']['name'] - user.length )
                .fill( this.config['output']['whitespace'] )
                .join( '' )
            user = `${user}${space}${this.config['output']['whitespace']}`
        } else {}

        const space2 = new Array( this.config['row']['maxLength']['points'] - `${points}`.length )
            .fill( this.config['output']['whitespace'] )
            .join( '' )
        const points_str = `${points}`

        let you = this.config['output']['whitespace']
        if( item['id'] === userId ) {
            result['user']['row'] = i - 1
            result['user']['item'] = item
            result['user']['rank'] = rank
            result['user']['points'] = points
            result['user']['userId'] = userId

            you = this.config['user']['symbol']
            user = `${user}${you}`
        } else {
            user = `${user}    `
        }

        const double = `${this.config['output']['whitespace']}${this.config['output']['whitespace']}`
        return [ result, `${rank_str}${double}${user}${double}${points_str}` ]
    }


    setRankingFull( { userId, dataset } ) {
        this.prepareList( { dataset } )

        this.rankingFull = {
            'user': {
                'row': null,
                'item': null
            },
            'str': null
        }

        let i = 0
        this.str = this.ranking
            .map( ( a, rindex ) => {
                const rank = rindex + 1
                const points = a['points']
                const rows = a['users']
                    .map( ( item, index ) => { 
                        i++
                        const [ r, row ] = this.formatRow( { 
                            i,
                            userId, 
                            index, 
                            rank, 
                            'result' : this.rankingFull, 
                            item,
                            userId,
                            points
                        } )
                        this.rankingFull = r

                        return row
                    } )
                    .join( this.config['output']['newLine'] )
                return rows
            } )
            .join( this.config['output']['newLine'] )

        this.rankingFull['str'] = this.str
        
        return this
    }


    setRankingWithLimit( { userId, dataset } ) {
        this.setRankingFull( { userId, dataset } ) 

        const limit = this.config['output']['maxRows']
    
        let result = ''
        if( this.rankingFull['user']['row'] > limit ) {
            const before = this.rankingFull['str']
                .split( this.config['output']['newLine'] )
                .filter( ( a, index ) => index <= limit-2 )
                .join( this.config['output']['newLine'] )

            const user = this.formatRow( { 
                'i': 1, 
                'userId': this.rankingFull['user']['userId'], 
                'index': 0, 
                'rank': this.rankingFull['user']['rank'], 
                'result': { 'user': {} }, 
                'item': this.rankingFull['user']['item'], 
                'points': this.rankingFull['user']['points']
            } )[ 1 ]
            
            result = `${before}
${this.config['output']['splitter']}
${user}`
        } else {
            result =  this.rankingFull['str']
            .split( this.config['output']['newLine'] )
            .filter( ( a, index ) => index <= limit )
            .join( this.config['output']['newLine'] )
        }

        this.str = result

        return this
    }


    addHeadline() {
        const headline = Object
            .keys( this.config['row']['maxLength'] )
            .map( ( key, index ) => {
                const str = key
                    .toLowerCase()
                    .replace( /(?:^|\s|-)\S/g, x => x.toUpperCase() )

                let space = new Array( this.config['row']['maxLength'][ key ] - str.length + ( 2 * ( index + 1 ) ) )
                    .fill( this.config['output']['whitespace'] )
                    .join( '' )

                index === 2 ? space = '' : ''
                return `${str}${space}`
            } )
            .join( '' )


        this.str = `<span>${this.config['output']['title']}</span>${this.config['output']['newLine']}<span>${headline}${this.config['output']['newLine']}</span>${this.str}`

        return this
    }


    toString() {
        return this.str
    }
}


class HUD {
    constructor() {
        this.config = {
            'window': {
                'w': null,
                'h': null
            },
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
            'landscape': {
                'use': 'w',
                'constrains': {
                    'w': {
                        'min': 50,
                        'max': 250
                    },
                    'h': {
                        'min': 50,
                        'max': 250
                    }
                },
                'resize': {
                    'percent': {
                        'min': 40,
                        'max': 100
                    },
                    'w': {
                        'min': 400,
                        'max': 1000,
                    },
                    'h': {
                        'min': 400,
                        'max': 1000
                    }
                },
                'size': {
                    'original': {
                        'w': null,
                        'h': null
                    },
                    'mapped': {
                        'w': null,
                        'h': null
                    }
                },
                'offset': {
                    'x': 15,
                    'y': 15
                }
            },
            'render': {
                'zIndex': {
                    'red': {
                        'opacity': 1,
                        'order': 4,
                        'scale': 16
                    },
                    'blue': {
                        'opacity': 1,
                        'order': 3,
                        'scale': 10
                    },
                    'green': {
                        'opacity': 1,
                        'order': 2,
                        'scale': 10
                    },
                    'grey': {
                        'opacity': 1,
                        'order': 5,
                        'scale': 10
                    },
                    'landscape': {
                        'opacity': 0.9,
                        'order': 1,
                        'scale': 10
                    },
                    'default': {
                        'opacity': 0.25,
                        'order': 1,
                        'scale': 10
                    }
                }
            }
        }
        this.landscape

        this.textures = {
            'landscape': null,
            'redDot': null,
            'blueDot': null
        }

        this.points = {}
    }


    init( { 
        landscapeTexture, 
        redDotTexture,
        blueDotTexture,
        greenDotTexture,
        greyDotTexture,
        userX,
        userY,
        terrainBounding
    } ) {
        this.textures['landscape'] = landscapeTexture
        this.textures['redDot'] = redDotTexture
        this.textures['blueDot'] = blueDotTexture
        this.textures['greenDot'] = greenDotTexture
        this.textures['greyDot'] = greyDotTexture

        this.initConfig()
        this.createLandscape()
        this.setMaterials()

        // this.setRange( range )
        // this.updateRedDot( { 'x': 0, 'y': 0, 'z': 0 } )
    }


    setMaterials() {
        this.materials = [ 'red', 'blue', 'green', 'grey' ]
            .reduce( ( acc, type, index ) => {
                let texture
                switch( type ) {
                    case 'red':
                        texture = this.textures['redDot']
                        break
                    case 'blue':
                        texture = this.textures['blueDot']
                        break
                    case 'green':
                        texture = this.textures['greenDot']
                        break
                    case 'grey':
                        texture = this.textures['greyDot']
                        break
                    default:
                        console.log( `Texture not found. Input: ${type}`)
                }
        
                acc[ type ] = new THREE.SpriteMaterial( { 
                    'map': texture,
                    'opacity': this.config['render']['zIndex'][ type ]['opacity']
                } )

                return acc
            }, {} )

    }


    addPoint( { id, x, y, type } ) {

        const struct = { 
            'type': type, 
            'originalX': x,
            'originalY': y,
            'x': x, 
            'y': y, 
            'status': 'activate'
        }

        // const onMap = this.getPointCoordinates( { x, y } )

        const sprite = this.createPoint( { 
            'type': struct['type']
        } )

        if( this.points.hasOwnProperty( id ) ) {
            console.log( `HUD ID is not unique: ${id}` )
        }

        this.points[ id ] = {
            ...struct,
            'sprite': sprite
        }

        this.updatePoint( { id, x, y } )

        return this.points[ id ]['sprite']
    }


    updateActivationsPoint( { deactivate=[], activate=[] } ) {
        deactivate
            .forEach( cmd => {
                const id = cmd['id']
                if( this.points.hasOwnProperty( id ) ) {
                    this.points[ id ]['sprite']['material'] = this.materials['grey']
                    this.points[ id ]['status'] = 'inactive'
                } else {
                    console.log( 'deactivate not found' )
                }
            } )
    
        activate
            .forEach( cmd => {
                const id = cmd['id']
                if( this.points.hasOwnProperty( id ) ) {
                    this.points[ id ]['type'] = 'green'
                    this.points[ id ]['sprite']['material'] = 
                        this.materials[ this.points[ id ]['type']  ]
                    this.points[ id ]['status'] = 'active'
                } else {
                    console.log( 'activate not found' )
               }
            } )
    }


    createPoint( { type } ) {
        let texture

        const w2 = this.materials[ type ].map.image.width
        const h2 = this.materials[ type ].map.image.height

        const sprite = new THREE.Sprite( this.materials[ type ] )
        sprite.center.set( 0.5, 0.5 )
        sprite.scale.set( 
            this.config['render']['zIndex'][ type ]['scale'], 
            this.config['render']['zIndex'][ type ]['scale'], 
            1 
        )
        return sprite
    }


    updatePoint( { id, x, y } ) {
        const type = this.points[ id ]['type']
        // console.log( 'Type', type )

        let zIndex = Object
            .entries( this.config['render']['zIndex'] )
            .find( a => { return a[ 0 ] === type } )

        if( zIndex === undefined ) {
            zIndex = this.config['render']['zIndex']['default']
        }

        this.points[ id ]['onMap'] = this.getPointCoordinates( { x, y } )
        this.points[ id ]['sprite'].position.set( 
            this.points[ id ]['onMap']['x'], 
            this.points[ id ]['onMap']['y'], 
            zIndex[ 1 ]['order']
        )
    }


    getPointCoordinates( { x=0, y=0 } ) {
        const struct = {
            'top_left': {
                'x': -( this.config['window']['w'] / 2 ) + this.config['landscape']['offset']['x'],
                'y': ( this.config['window']['h'] / 2 ) - this.config['landscape']['offset']['y']
            },
            'constrains': {
                'x': {
                    'min': null,
                    'max': null
                },
                'y': {
                    'min': null,
                    'max': null
                }
            },
            'position': {
                'x': x,
                'y': y
            },
            'onMap': {
                'x': null,
                'y': null
            }
        }

        struct['constrains']['x']['min'] = struct['top_left']['x']
        struct['constrains']['x']['max'] = struct['top_left']['x'] + this.config['landscape']['size']['mapped']['w']

        struct['constrains']['y']['min'] = struct['top_left']['y']
        struct['constrains']['y']['max'] = struct['top_left']['y'] - this.config['landscape']['size']['mapped']['h']

        struct['onMap'] = Object
            .entries( struct['position'] )
            .reduce( ( acc, a, index ) => {
                let [ key, value ] = a
                acc[ key ] = this.mapValues( { 
                    value, 
                    'v1': this.config['bounding'][ key ]['start'], 
                    'v2': this.config['bounding'][ key ]['end'], 
                    'v3': struct['constrains'][ key ]['min'], 
                    'v4': struct['constrains'][ key ]['max'],
                    'bounding': true,
                    'swapValues': false // a === 'x' ? false : true
                } )

                // console.log( 'result', acc[ key ] )
                // console.log()

                return acc
            }, {} )

        return struct['onMap']
    }


    getPositionFromLandscapeMouseOver( { mouseX, mouseY } ) {
        const struct = {
            'position': {
                'x': mouseX,
                'y': mouseY
            },
            'x': {
                'start': null,
                'end': null
            },
            'y': {
                'start': null,
                'end': null
            }
        }

        const result = {
            'inside': false,
            'position': null
        }
       
        struct['x']['start'] = this.config['landscape']['offset']['x']
        struct['x']['end'] = struct['x']['start'] + this.config['landscape']['size']['mapped']['w']

        struct['y']['start'] = this.config['landscape']['offset']['y']
        struct['y']['end'] = struct['y']['end'] + this.config['landscape']['size']['mapped']['h']

        if( mouseX >= struct['x']['start'] && mouseX <= struct['x']['end'] ) {
            if( mouseY >= struct['y']['start'] && mouseY <= struct['y']['end'] ) {
                result['inside'] = true
                result['position'] = [ 'x', 'y' ]
                    .reduce( ( acc, key, index ) => {
                        acc[ key ] = this.mapValues( {
                            'value': struct['position'][ key ], 
                            'v1': struct[ key ]['start'],
                            'v2': struct[ key ]['end'],
                            'v3': this.config['bounding'][ key ]['start'],
                            'v4': this.config['bounding'][ key ]['end']
                        } )

                        return acc
                    }, {} )
            }
        }

        return result
    }


    addListenerWindowResize( { x, y } ) {
        this.updateConfig()
        this.updateLandscape()
        this.updatePoints()
        

            /*
        this.points
            .entries( )
            .forEach( item => {
                this. updatePoint( { 
                    'id': item['id'], 
                    'x': item['originalX'], 
                    'y': item['originalY'] 
                } )
            } )
*/
       // console.log( 'AAA', this.points )
       // this.updateRedRot( { x, y } )
    }


    initConfig() {
        this.config['landscape']['size']['original']['w'] = 
            this.textures['landscape'].image.width
        this.config['landscape']['size']['original']['h'] = 
            this.textures['landscape'].image.height
        //debugger
/*
        Object
            .entries( terrainRange )
            .forEach( a => {
                if( a[ 0 ] === 'x' || a[ 0 ] === 'z' ) {
                    const k = a[ 0 ] === 'z' ? 'y' : 'x'
                    const b = [ 'from', 'to' ]
                        .forEach( key => {
                            this.config['range'][ k ][ key ] = 
                                terrainRange[ k ][ key ]
                        } )

                    
                }
            } )
        
        console.log( '>>>', this.config['range'] )
*/
        this.updateConfig()
    }


    updateConfig() {
        this.config['window']['w'] = window.innerWidth
        this.config['window']['h'] = window.innerHeight

        const key = this.config['landscape']['use']
        const constrains = this.config['landscape']['constrains'][ key ]

        const struct = {
            'original': {
                'w': this.config['landscape']['size']['original']['w'],
                'h': this.config['landscape']['size']['original']['h']
            },
            'resized': {
                'percent': null,
                'w': null,
                'h': null
            },
            'constrained': {
                'w': null,
                'h': null
            }
        }

        const resize = this.config['landscape']['resize'][ key ]
        if( this.config['window'][ key ] > resize['max'] ) {
            struct['resized']['percent'] = this.config['landscape']['resize']['percent']['max']
        } else if( this.config['window'][ key ] < resize['min'] ) {
            struct['resized']['percent'] = this.config['landscape']['resize']['percent']['min']
        } else {
            struct['resized']['percent'] = this.mapValues( {
                'value': this.config['window'][ key ], 
                'v1': resize['min'],
                'v2': resize['max'],
                'v3': this.config['landscape']['resize']['percent']['min'],
                'v4': this.config['landscape']['resize']['percent']['max']
            } )
        }

        const r = [ 'w', 'h' ]
            .forEach( k => {
                struct['resized'][ k ] =
                    ( struct['original'][ k ] * struct['resized']['percent'] ) / 100
            } )

        if( struct['resized'][ key ] < constrains['min'] ) {
            struct['constrained'][ key ] = constrains['min']
        } else if( struct['resized'][ key ] > constrains['max'] ) {
            struct['constrained'][ key ] = constrains['max']
        } else {
            struct['constrained'][ key ] = struct['resized'][ key ]
        }

        const keyOpposite = [ 'w', 'h' ]
            .filter( a => a !== key )[ 0 ]

        struct['constrained'][ keyOpposite ] =
            ( struct['resized'][ keyOpposite ] * struct['constrained'][ key ] ) / struct['resized'][ key ]

        Object
            .entries( struct['constrained'] )
            .forEach( a => this.config['landscape']['size']['mapped'][ a[ 0 ] ] = a[ 1 ] )
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


    createLandscape() {
        const material = new THREE.SpriteMaterial( { 
            'map': this.textures['landscape'],
            'opacity': this.config['render']['zIndex']['landscape']['opacity']
        } )

        this.landscape = new THREE.Sprite( material )
        this.landscape.center.set( 0.0, 1.0 )
        this.updateLandscape()
    }


    updateLandscape() {
        this.landscape.scale.set(
            this.config['landscape']['size']['mapped']['w'], 
            this.config['landscape']['size']['mapped']['h'], 
            5
        )

        const offset_w = -( this.config['window']['w'] / 2 )
        const offset_h = this.config['window']['h'] / 2

        const x = offset_w + this.config['landscape']['offset']['x']
        const y = offset_h - this.config['landscape']['offset']['y']

        this.landscape.position.set( 
            x, 
            y, 
            this.config['render']['zIndex']['landscape']['order']
        )
    }


    updatePoints() {
        Object
            .entries( this.points )
            .filter( a => !a[ 0 ].startsWith( 'user' ) )
            .forEach( ( a, index ) => {
                this. updatePoint( { 
                    'id': a[ 0 ], 
                    'x': a[ 1 ]['originalX'], 
                    'y': a[ 1 ]['originalY'] 
                } )
            } )

        return true
    }

/*
    createRedDot( { x, y } ) {
        const material2 = new THREE.SpriteMaterial( { 
            'map': this.textures['redDot']
        } )

        const w2 = material2.map.image.width
        const h2 = material2.map.image.height

        this.redDot = new THREE.Sprite( material2 )
        this.redDot.center.set( 0.5, 0.5 )
        this.redDot.scale.set( 10, 10, 1 )
        this.updateRedDot( { x, y } )
    }


    updateRedDot( { x=0, y=0 } ) {
        const struct = {
            'top_left': {
                'x': -( this.config['window']['w'] / 2 ) + this.config['landscape']['offset']['x'],
                'y': ( this.config['window']['h'] / 2 ) - this.config['landscape']['offset']['y']
            },
            'constrains': {
                'x': {
                    'min': null,
                    'max': null
                },
                'y': {
                    'min': null,
                    'max': null
                }
            },
            'position': {
                'x': x,
                'y': y
            },
            'onMap': {
                'x': null,
                'y': null
            }
        }

        struct['constrains']['x']['min'] = struct['top_left']['x']
        struct['constrains']['x']['max'] = struct['top_left']['x'] + this.config['landscape']['size']['mapped']['w']

        struct['constrains']['y']['min'] = struct['top_left']['y']
        struct['constrains']['y']['max'] = struct['top_left']['y'] - this.config['landscape']['size']['mapped']['h']

        struct['onMap'] = Object
            .entries( struct['position'] )
            .reduce( ( acc, a, index ) => {
                let [ key, value ] = a

                // console.log( 'value', value )
                // console.log( `v1:${this.config['bounding'][ key ]['start']}, v2:${this.config['bounding'][ key ]['end']}`)
                // console.log( `v3:${struct['constrains'][ key ]['min']}, v4:${struct['constrains'][ key ]['max']}`)

                acc[ key ] = this.mapValues( { 
                    value, 
                    'v1': this.config['bounding'][ key ]['start'], 
                    'v2': this.config['bounding'][ key ]['end'], 
                    'v3': struct['constrains'][ key ]['min'], 
                    'v4': struct['constrains'][ key ]['max'],
                    'bounding': true,
                    'swapValues': false //a === 'x' ? false : true
                } )

                // console.log( 'result', acc[ key ] )
                // console.log()

                return acc
            }, {} )

        this.redDot.position.set( 
            struct['onMap']['x'], 
            struct['onMap']['y'], 
            1 
        )
    }


    createBlueDot() {

    }

/*
    calculateDisplaySize() {

    }


    setRange( range ) {
       // console.log( 'range before', range )
        this.config['landscape']['transform'] = Object
            .entries( range )
            .reduce( ( acc, a, index ) => {
                acc[ a[ 0 ] ] = {}
                acc[ a[ 0 ] ]['v1'] = a[ 1 ]['from'],
                acc[ a[ 0 ] ]['v2'] = a[ 1 ]['to']
                acc[ a[ 0 ] ]['v3'] = 0,
                acc[ a[ 0 ] ]['v4'] = this.config['landscape']['size']['original'][ a[ 0 ] ]
                return acc
            }, {} )
            //console.log( 'range after', this.config['landscape']['transform'] )
    }
*/



/*
    updateRedDot( { x, y, z } ) {
        const width = window.innerWidth / 2
        const height = window.innerHeight / 2

        const pos = this.transformRangeV3( { x, y, z } )

        //console.log( '>>>', pos )

       // this.redDot.position.set( -width, height, 1 )
        this.redDot.position.set( 
            -( window.innerWidth/2 ),  
            0, 
            0 
        )
    }


    transformRangeV3( { x, y, z } ) {
        //console.log( 'poo', position )
        const pos = [ x, y ]
            .reduce( ( acc, value, index ) => {
                const key = index === 0 ? 'x' : 'y'
                const start1 = this.config['landscape']['transform'][ key ]['v1']
                const stop1 = this.config['landscape']['transform'][ key ]['v2']
                const start2 = this.config['landscape']['transform'][ key ]['v3']
                const stop2 = this.config['landscape']['transform'][ key ]['v4']

                acc[ key ] = ( value - start1 ) / ( stop1 - start1 ) * ( stop2 - start2 ) + start2

                console.log( `${value}, ${start1}, ${stop1}, ${start2}, ${stop2}`)
                console.log( `>> ${acc[ key ]}`)
                console.log( `--------` )

                return acc 
            }, {} )

        return pos
    }
*/
}


class GuiInterface {
    constructor( ) {
        this.config = {
            'close': true,
            'show': false
        }

        this.gui = new dat.GUI()
        this.folders = []
    }


    init( { show, config } ) {
        this.config['show'] = show
        Object
            .keys( config )
            .forEach( ( key, index ) => this.insertTypes( key, config[ key ], index ) )

        this.gui.add(
            { 
                'REFRESH': ()  => { 
                    console.log(  'clicked' ) 
                    metaverse.refresh()
                } 
            },
            'REFRESH'
        )

        if( this.config['close'] ) {
            this.gui.close()
        }

        if( !this.config['show'] ) {
            this.hide()
        } else {
            this.gui.show()
        }
    }


    toggleVisibility() {
        this.config['show'] = this.config['show'] ? false : true
        if( !this.config['show'] ) {
            this.gui.hide()
        } else {
            this.gui.show()
        }
    }


    show() {
        this.config['show'] = true
        this.gui.show()
    }


    hide() {
        this.config['show'] = false
        this.gui.hide()
    }

    
    detectType( obj ) {
        return Object.prototype.toString
            .call( obj )
            .slice( 8, -1 )
            .toLowerCase()
    }


    getCharFromNumber( i ) {
        const alphabet = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'
        ]
        
        return alphabet[ i ]
    }


    getTitleized( str ) {
        str = str.replace( /([A-Z])/g, " $1" );
        str = str.charAt( 0 ).toUpperCase() + str.slice( 1 )
        str = str.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase())

        return str
    }


    insertTypes( name, obj, index, subFolder=null, level=0, prefix='' ) {

        /*
        if( subFolder === null ) {
            this.folders.push( this.gui.addFolder( name ) )
        } else {
        }

        */

        let currentFolder = null
        if( subFolder === null ) {
            prefix += `${this.getCharFromNumber( index )}. `
            currentFolder = this.gui.addFolder( `${prefix}${this.getTitleized( name )}` )
        } else {
            currentFolder = subFolder
        }

        Object
            .entries( obj )
            .forEach( ( a, rindex ) => {
                const [ key, value ] = a
                let use = false
                const currentType = this.detectType( value )
                const follow = Object.keys( obj ).length-1 === rindex ? '└' : '├'
                const nn  = `  ${a[ 0 ]}`

                switch( currentType ) {
                    case 'array':
                        break
                    case 'object':
                        switch( level ) {
                            case 0:
                                break
                            case 1:
                                break
                            case 2:
                                break
                        }

                        const str = `       └  ${this.getTitleized( a[ 0 ] )}`
                        const sF = currentFolder
                            .addFolder( str )

                        this.insertTypes( a[ 0 ], a[ 1 ], index, sF, level++, '' )

                        break
                    case 'string':
                        currentFolder
                            .add( obj, a[ 0 ] )
                            .name( nn )
                        break
                    case 'date':
                        break
                    case 'number':
                        if( a[ 0 ] === 'color' ) {
                            currentFolder
                                .addColor( obj, a[ 0 ] )
                                .name( nn )
                                .onFinishChange( ( a ) => { metaverse.refresh() } )
                                
                        } else {
                            use = true
                            currentFolder
                                .add( obj, a[ 0 ] )
                                .name( nn )
                                .onFinishChange( ( a ) => { metaverse.refresh() } )
                        }
                        break
                    case 'function':
                        break
                    case 'regexp':
                        break
                    case 'boolean':
                        use = true
                        currentFolder
                            .add( obj, a[ 0 ] )
                            .name( nn )
                            .onChange( ( a ) => { metaverse.refresh() } )
                        break
                    case 'null':
                        break
                    case 'undefined':
                        break
                    default:
                        break
                }
            } )
    }
}


class JoyStick {
    constructor() {
        this.config = {
            'default': {
                'maxRadius': 40,
                'rotationDamping': 0.06,
                'moveDamping': 0.01
            },
            'css': {
                'circle': [
                    'position:absolute;',
                    'bottom:35px;',
                    'width:80px;',
                    'height:80px;',
                    'background:rgba(126, 126, 126, 0.5);',
                    'border:#444 solid medium;',
                    'border-radius:50%;',
                    'left:50%;',
                    'transform:translateX(-50%);'
                ],
                'thumb': [
                    'position: absolute;',
                    'left: 20px;',
                    'top: 20px;',
                    'width: 40px;',
                    'height: 40px;',
                    'border-radius: 50%;',
                    'background: #fff;'
                ]
            }
        }

        this.init()
    }


    init( options={} ) {
        const circle = document.createElement( 'div' )
        circle.style.cssText = this.config['css']['circle'].join( ' ' )

        const thumb = document.createElement( 'div' )
        thumb.style.cssText = this.config['css']['thumb'].join( ' ' )
        circle.appendChild( thumb )
        document.body.appendChild( circle )

        this.domElement = thumb
        this.maxRadius = options.maxRadius || this.config['default']['maxRadius']
        this.maxRadiusSquared = this.maxRadius * this.maxRadius
        this.onMove = this.joystickCallback //options.onMove

        this.game = options.game
        this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop }
        this.rotationDamping = options.rotationDamping || this.config['default']['rotationDamping']
        this.moveDamping = options.moveDamping || this.config['default']['moveDamping']

        if( this.domElement != undefined ) {
            const joystick = this
            if( 'ontouchstart' in window ) {
                this.domElement.addEventListener( 
                    'touchstart', 
                    ( a ) => { joystick.tap( a ) } 
                )
            } else {
                this.domElement.addEventListener( 
                    'mousedown', 
                    ( a ) => { joystick.tap( a ) } 
                )
            }
        }
    }


    joystickCallback( forward, turn ) { 
        state['joystick']['forward'] = forward
        state['joystick']['turn'] = -turn
    }

  
    getMousePosition( evt ) {
        const result = {
            'x': null,
            'y': null
        }

        result['x'] = evt.targetTouches ? evt.targetTouches[ 0 ].pageX : evt.clientX
        result['y'] = evt.targetTouches ? evt.targetTouches[ 0 ].pageY : evt.clientY

        return result
    }


    tap( evt=window.event ) {
        // console.log( 'TAP' )
        // evt = evt || window.event;
        this.offset = this.getMousePosition( evt )
        const joystick = this
        if( 'ontouchstart' in window ) {
            document.ontouchmove = ( evt ) => { joystick.move( evt ) }
            document.ontouchend =  ( evt ) => { joystick.up( evt ) }
        } else{
            document.onmousemove = ( evt ) => { joystick.move( evt ) }
            document.onmouseup = ( evt ) => { joystick.up( evt ) }
        }
    }
    
    
    move( evt ) {
        // console.log( 'MOVE' )
        evt = evt || window.event
        const mouse = this.getMousePosition( evt )
        // calculate the new cursor position:
        let left = mouse.x - this.offset.x
        let top = mouse.y - this.offset.y
        // this.offset = mouse;

        const sqMag = left * left + top * top
        if( sqMag > this.maxRadiusSquared ) {
            // Only use sqrt if essential
            const magnitude = Math.sqrt( sqMag )
            left /= magnitude;
            top /= magnitude;
            left *= this.maxRadius;
            top *= this.maxRadius;
        }

        // set the element's new position:
        this.domElement.style.top = `${top + this.domElement.clientHeight / 2}px`;
        this.domElement.style.left = `${left + this.domElement.clientWidth / 2}px`;

        //@TODO use nipple,js
        const forward = - ( top - this.origin.top + this.domElement.clientHeight / 2 ) / this.maxRadius;
        const turn = ( left - this.origin.left + this.domElement.clientWidth / 2 ) / this.maxRadius;

        if ( this.onMove !== undefined ) {
            this.onMove.call( this.game, forward, turn )
        }
    }


    up( evt ) {
        if( 'ontouchstart' in window ) {
            document.ontouchmove = null
            document.touchend = null
        } else{
            document.onmousemove = null
            document.onmouseup = null
        }

        this.domElement.style.top = `${this.origin.top}px`
        this.domElement.style.left = `${this.origin.left}px`

        this.onMove.call( this.game, 0, 0 )
    }
}


const Metaverse = class Metaverse {
    constructor() {
        this.template = {
            'assets':  {
                'mesh': {
                    'astronaut': 'https://raw.githubusercontent.com/baronwatts/models/master/astronaut.glb',
                    'moonVehicle': 'https://raw.githubusercontent.com/baronwatts/models/master/moon-vehicle2.js',
                    'autumGirl': 'https://raw.githubusercontent.com/baronwatts/models/master/autumn_girl_01.glb',
                    'userMesh': 'astronaut'
                },
                'textures': {
                    'snowflake': './assets/snowflake.png',
                    // 'flag': './assets/flag.png',
                    'landscape': './assets/hud-purple.png',
                    'nft': './assets/nft.png',
                    'done': './assets/images/empty-2.jpg',
                    'redDot': './assets/dots/red.png',
                    'greyDot': './assets/dots/white.png',
                    'blueDot': './assets/dots/grey.png',
                    'greenDot': './assets/dots/yellow-2.png',
                    'radar': './assets/radar.png',
                    'binance': './assets/images/binance.jpg',
                    'polygon': './assets/images/polygon.jpg',
                    'fantom': './assets/images/fantom.jpg'
                },
                'heightmap': {
                    'precalculated': true,
                    'localVar': "heightmap_1665857562['data']",
                    'png': './assets/heightmap.png',
                    'local': './src/heightmap-1665857562.json'
                },
                'datas': {
                    'objects': './getObjectsAll',
                    'standings': './getStandings'
                },
                'fonts': {
                    'optimerRegular': './font/optimer-regular.json'
                }
            },
            'camera': {
                'perspective': {
                    'offset': {
                        'x': 0.0,
                        'y': 1.1,
                        'z': -1.0,
                    },
                    'start': {
                        'x': -216,
                        'y': 30,
                        'z': -40
                    },
                    'fov': 45, 
                    'near': 0.01, 
                    'far': 100000,
                    'lerp': 0.05,
                    'lookAt': 1.1
                },
                'orthographic': {
                    'near': 1,
                    'far': 10,
                    'z': 10
                }
            },
            'landscape': {
                'gradient': {
                    'colors': [ 
                        /*
                        [ 0.00, 0x88F7E2 ], 
                        [ 0.25, 0x44D492 ], 
                        [ 0.50, 0xF5EB67 ], 
                        [ 0.75, 0xFFA15C ], 
                        [ 1.00, 0xfed3d8 ]
                        */
                       [ 0.0, 0xd12d9c ], //
                       [ 0.9, 0x5ea2ef ], // blau
                       [ 1, 0x1a0c4f ] // dunkel lila
                    ],
                    'axis': 'z',
                    'reverse': true
                },
                'heightmap': {
                    'height': {
                        'min': 0,
                        'max': 60
                    },
                    'position': {
                        'x': null,
                        'y': null,
                        'z': null
                    },
                    'size': {
                        'x': 128,
                        'y': 128
                    },
                    'start': {
                        'x': null,
                        'y': null,
                        'z': null
                    },
                    'bounding': {
                        'x': {
                            'left': -640,
                            'right': -630
                        },
                        'y': {
                            'top': 630,
                            'bottom': -640
                        }
                    },
                    'elementSize': 10,
                    'mass': 0
                },
                'material': {
                    'color': 0x888888
                },
                'castShadow': false,
                'receiveShadow': true,
                'wireframe': false
            },
            'userMesh': {
                'box': {
                    'x': .5,
                    'y': 1.0,
                    'z': .5
                },
                'light': {
                    'color': 0xFFFFFF,
                    'intensity': 0.5,
                    'x': 0.0,
                    'y': 1.0,
                    'z': 0.0,
                    'castShadow': true
                },
                'positionPlayer': {
                    'x': 0.0,
                    'y': -0.1,
                    'z': 0.0
                },
                'positionMesh': {
                    'x': 0.0,
                    'y': 0.0,
                    'z': 60.0
                },
                'scale': {
                    'x': 0.25,
                    'y': 0.25,
                    'z': 0.25
                },
                'translate': {
                    'x': 0.0,
                    'y': 0.5,
                    'z': 0.0
                },
                'castShadow': true,
                'transparent': true,
                'opacity': 0.0
            },
            'sprites': {
                'offsetY': 0.75,
                'distance': 10,
            },
            'objects': {
                'offsetY': 0.75,
                'scaleX': 4,
                'scaleY': 4,
                'highlight':  {
                    'point': {
                        'color': 'orange',
                        'intensity': 1.5,
                        'decay': 5
                    },
                    'directional': {
                        'color': 'white',
                        'intensity': 0,
                        'castShadow': false
                    }
                },
                'nearest': {
                    'limit': 10
                }
            },
            'axis': {
                'offsetY': 0.25,
                'size': 5,
                'distance': 10
            },
            'pointsOfInterests': {
                'points': [
                    {
                        'type': 'flag',
                        'active': true,
                        'flag': {
                            'position': {
                                'x': 10,
                                'z': 50
                            },
                            'width': 0.15, 
                            'height': 2, 
                            'depth': 0.15,
                            'transparent': true,
                            'opacity': 0
                        },
                        'cylinder': {
                            'radiusTop': .03,
                            'radiusBottom': .03,
                            'height': 4,
                            'radialSegments': 32,
                            'castShadow': true,
                            'color': 'grey'
                        },
                        'plane': {
                            'width': 600,
                            'height': 430,
                            'widthSegments': 20,
                            'heightSegments': 20,
                            'scale': {
                                'x': .0025,
                                'y': .0025,
                                'z': .0025
                            },
                            'position': {
                                'x': 0,
                                'y': 1.5,
                                'z': 0
                            },
                            'castShadow': false
                        },
                        'light': {
                            'point': {
                                'color': 'orange',
                                'intensity': 1.5,
                                'decay': 5
                            },
                            'directional': {
                                'color': 'white',
                                'intensity': 0,
                                'castShadow': false
                            }
                        }
                    },
                    {
                        'type': 'flag',
                        'active': false,
                        'flag': {
                            'position': {
                                'x': 10,
                                'z': 50 + 50
                            },
                            'width': 0.15, 
                            'height': 2, 
                            'depth': 0.15,
                            'transparent': true,
                            'opacity': 0
                        },
                        'cylinder': {
                            'radiusTop': .03,
                            'radiusBottom': .03,
                            'height': 4,
                            'radialSegments': 32,
                            'castShadow': true,
                            'color': 'grey'
                        },
                        'plane': {
                            'width': 600,
                            'height': 430,
                            'widthSegments': 20,
                            'heightSegments': 20,
                            'scale': {
                                'x': .0025,
                                'y': .0025,
                                'z': .0025
                            },
                            'position': {
                                'x': 0,
                                'y': 1.5,
                                'z': 0
                            },
                            'castShadow': false
                        },
                        'light': {
                            'point': {
                                'color': 'orange',
                                'intensity': 1.5,
                                'decay': 5
                            },
                            'directional': {
                                'color': 'white',
                                'intensity': 0,
                                'castShadow': false
                            }
                        }
                    }
                ]
            },
            'controls': {
                'helper': {
                    'show': false
                },
                'gui': {
                    'query': '.dg .c input[type="checkbox"]',
                    'show': false
                },
                'joystick': {
                    'maxSteerVal': 0.05,
                    'maxForce': 0.15
                }
            },
            'world': {
                'gravity': {
                    'x': 0,
                    'y': -10,
                    'z': 0,
                    'contactMaterialFiction': 0,
                    'restitution': 0,
                    'contactEquationStiffness': 1000
                },
                'light': {
                    'color': 0x808080,
                    'itensity': 1.0,
                    'x': 1.0,
                    'y': 1.0,
                    'z': 1.0
                },
                'particles': {
                    'size': 4,
                    'color': 0xFFFFFF,
                    'blending': THREE.AdditiveBlending,
                    'depthWrite': false,
                    'transparent': true,
                    'opacity': 0.75,
                    'scale': 1,
                    'random': [ [ 30, 40 ], [ -500, 500 ], [ -500, 500 ] ],
                    'totalStars': 1000
                }
            },
            'renderer': {
                'shader': {
                    'renderToScreen': true,
                    'hTiltEnabled': false
                },
                'autoClear': false,
                'shadowMapType': THREE.PCFShadowMap,
                'alpha': true,
                'antialias': true,
                'fixedTimeStep': 1.0 / 60.0,
                'scale': 2,
                'shadowMap': true,
                'shadowMapSoft': true
            },
            'websocket': {
                'channels': [
                    {
                        'type': 'standings',
                        'name': 'pingStandings',
                        'symbol': '🔥'
                    },
                    {
                        'type': 'objects',
                        'name': 'pingObjects',
                        'symbol': 'x'
                    }
                ],
                'pingInterval': 1000,
                'handshake': 'handshake123',
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
            'meta': {
                'stage': 'development'
            }
        }

        this.template['landscape']['heightmap']['start']['x'] = 0
        this.template['landscape']['heightmap']['start']['y'] = this.template['landscape']['heightmap']['height']['max'] - 3
        this.template['landscape']['heightmap']['start']['z'] = this.template['landscape']['heightmap']['size']['y'] * 0.5 - 10

        this.template['landscape']['heightmap']['position']['x'] = 
            -this.template['landscape']['heightmap']['size']['x'] * this.template['landscape']['heightmap']['elementSize'] / 2
        this.template['landscape']['heightmap']['position']['y'] = -10
        this.template['landscape']['heightmap']['position']['z'] = 
            this.template['landscape']['heightmap']['size']['y'] * this.template['landscape']['heightmap']['elementSize'] / 2

        this.scenePerspective
        this.cameraPerspective
        this.renderer
        this.hud
        this.light
        this.composer
        this.preloadStatus
        this.preloads
        this.socket
        this.state
        //  this.controls
        this.gui
        this.geometry
        this.mesh
        this.config

        this.mixers
        this.clip1
        this.clip2
        this.clip3

        this.flagLocation
        this.pos = []
        this.posLight = []

        this.flagLight
        this.terrainBody
        this.raycastHelperMesh
        this.followCam
        this.modifier
        this.lasttime
        this.clock = new THREE.Clock()


        this.index = 0


        this.materials = {}
    }


    async init( silent=false ) {
        this.silent = silent
        this.config = JSON.parse( JSON.stringify( this.template ) )

        this.state = {
            'poi': [],
            'objects': [],
            'planes': [],
            'socket': {
                'connected': false,
                'connectedSymbol': this.config['console']['symbols']['failed']
            },
            'objects': [],
            'user': {
                'name': null,
                'cryptoAddress': null,
                'cryptoChain': null,
                'points': null
            }
        }
        
        this.checkUrlParams()
        this.addRenderer()
        this.addListenerResize()
        // this.addModifyThreeDefault()
        this.addControls()

        await this.preload()

        this.materials['nft_template'] = new THREE.SpriteMaterial( { 
            'map': this.preloads['textures__nft'] 
        } )

        this.materials['nft_done'] = new THREE.SpriteMaterial( { 
            'map': this.preloads['textures__done'] 
        } )

        await this.refresh()
    }
 

    async refresh( silent=false ) {
        this.scenePerspective = null
        this.world = null
        this.cameraPerspective = null
        this.pos = []
        this.posLight = []
        // this.mesh = null

        this.addScene()
        
        this.addPhysics()
        this.addFrontAndBackLight()
        // this.addEffects()
        
        await this.addTerrain()
        this.addMeshAstronaut()

        this.addSkyParticles()
        this.addHUD()
        console.log( 'HERE')
        this.addObjects()


        //this.addWebsocket()
        this.createHighlight()

        this.config['pointsOfInterests']['points']
            .forEach( cmd => {
                if( cmd['active'] ) {
                    switch( cmd['type'] ) {
                        case 'flag':
                            // this.addMeshFlag( { cmd } )
                            break
                        default:
                            console.log( 'poi not found' )
                            break
                    }
                }
            } )
        
        this.followCam = new THREE.Object3D()
        this.followCam.position.copy( this.cameraPerspective.position )

        this.scenePerspective.add( this.followCam )
        this.followCam.parent = this.mesh

    }


    addListenerKeyboard() {
        window.addEventListener(
            'keypress', 
            ( a ) => {
                switch( a.code ) {
                    case 'Digit1':
                        this.config['controls']['helper']['show'] = this.config['controls']['helper']['show'] ? false : true
                        break
                    case 'Digit2':
                        this.gui.toggleVisibility()
                        break
                    case 'Digit3':
                        this.standings.toggleVisibility()
                        break
                    case 'Digit4':
                        this.addInteractive()
                        break
                    case 'Space':
                        this.addAxisHelper()
                        break
                    case 'Enter':
                        this.config['controls']['helper']['show'] = this.config['controls']['helper']['show'] ? false : true

                        if( this.config['controls']['helper']['show'] ) {
                            this.gui.show()
                        } else {
                            this.gui.hide()
                        }

                        break
                    default: 
                        break
                }
            } 
        )        
    }


    addListenerMouse() {
        /*
        window.addEventListener(
            'mousemove', 
            ( event ) => {
               // console.log( `${event}, ${event.client.y}`)
            }
        )
*/
        window.addEventListener(
            'mousedown', 
            ( event ) => {
                const coordinates = this.hud.getPositionFromLandscapeMouseOver( {
                    'mouseX': event.clientX,
                    'mouseY': event.clientY
                } )

                if( coordinates['inside'] ) {
                    this.updateMeshPosition( {
                        'x': coordinates['position']['x'],
                        'y': 50,
                        'z': coordinates['position']['y']
                    } )
                } else { 
                    const intersects = this.raycastMouseMovement( event )
                    if( intersects['found'] ) {
                        this.mesh.position.set( 
                            intersects['vector3']['x'],
                            intersects['vector3']['y'],
                            intersects['vector3']['z'] - 5
                        )
    
                        this.mesh.lookAt( intersects['vector3'] )
                    }
                }
            }
        )
    }


    addWebsocket() {
        const query = [
            [ 'handshake', this.config['websocket']['handshake'] ],
            [ 'userName', this.state['user']['userName'] ],
            [ 'cryptoAddress', this.state['user']['cryptoAddress'] ],
            [ 'cryptoChain', this.state['user']['cryptoChain'] ]
        ]
            .map( ( a, index ) => `${a[ 0 ]}=${a[ 1 ]}` )
            .join( '&' )

        this.socket = io.connect( '', { query } )


        const _standings = this.config['websocket']['channels']
            .find( a => a['type'] === 'standings' )

        this.socket.on(
            _standings['name'], 
            ( msg ) => {
                console.log( `${_standings['symbol']} ${msg}`)
                fetch( this.config['assets']['datas']['standings'] )
                    .then( response => response.json() )
                    .then( standings => {
                        const search = this.state['socket']['userId']
                        this.state['user']['points'] = 
                            standings['data'].find( a => a['id'] === search )['points']

                        this.standings
                            .updateBoard( { 
                                'dataset': standings 
                            } ) 
                    } )
                    .catch( e => console.log( `>>> standings not found. ${e}` ) )
            }
        )


        const _objects = this.config['websocket']['channels']
            .find( a => a['type'] === 'objects' )

        this.socket.on(
            _objects['name'], 
            ( msg ) => {
                const cmds = JSON.parse( JSON.stringify( msg ) )
                const j = cmds['cmds']
                    .reduce( ( acc, a, index ) => {
                        index === 0 ? acc[ a['type'] ] = [] : ''
                        acc[ a['type'] ].push(
                            {
                                'id': a['id'],
                                'chain': a['chain']
                            }
                        )
                        return acc
                    }, {} )

                this.updateActivations( j )
                console.log( `${_objects['symbol']} ${JSON.stringify( msg )}`)
            }
        )

        this.socket.on( 
            'connect', 
            () => {
                this.state['socket']['userId'] = this.socket.io.engine.id
                console.log( `${this.config['console']['symbols']['ok1']} Connect to Server: ${this.state['socket']['userId'] }` )
                this.state['socket']['connected'] = true
                this.state['socket']['connectedSymbol'] = this.config['console']['symbols']['ok1']

                this.addStandings()
                this.addMina()
                /*
                fetch( './getObjects' )
                    .then( response => response.json() )
                    .then( objects => {
                        this.addObjects( { objects } )
                    } )
                */
            }
        )

        this.socket.on( 
            'disconnect', 
            () => {
                console.log(`${this.config['console']['symbols']['failed']} Disconnect Server:` )
                this.state['socket']['connected'] = false
                this.state['socket']['connectedSymbol'] = this.config['console']['symbols']['failed']
            } 
        )


        const interval = setInterval( 
            () => {
                
            }, 
            this.config['websocket']['pingInterval']
        )

        // socket.emit('chat message', input.value)

    }


    addMina() {
        // walletMina.createBoard()
    }


    addJoystick() {
        this.joystick = new JoyStick()
    }


    addObjects() {

        const objects = this.preloads['json__fromServer']
        // console.log( objects['data'] )

        this.state['objects'] = {}
        this.state['objects']['progress'] = objects['progress']
        this.state['objects']['data'] = objects['data']
            .map( item => {
                switch( item['status'] ) {
                    case 'active':
                        item['type'] = 'green'
                        break
                    case 'found':
                        item['type'] = 'grey'
                        break
                    default:
                        console.log( `${item['status']}: Status not found.` )
                        break
                }

                const raycaster2 = new THREE.Raycaster( 
                    new THREE.Vector3( item['x'], 100, item['y'] ), 
                    new THREE.Vector3( 0, -1, 0 ) 
                )

                const intersects = raycaster2
                    .intersectObject( this.terrainBody.threemesh.children[ 0 ] )

                if( intersects.length > 0 ) {
                    console.log( '')
                    item['intersectionY'] = intersects[ 0 ].point.y
                    item['visible'] = true
                } else {
                    // console.log( 'objects are not visible' )
                    item['visible'] = true
                }

                return item
            } )

        this.calculateNearestObjects( { objects } )

        this.state['objects']['data']
            .filter( a => a['visible'] )
            .forEach( item => { 
                // console.log( 'item', item )
                this.addObjectToMap( item )
                this.addObjectToTerrain( item )
        } )
    }


    updateObjectsY() {
        this.scenePerspective.children
            .forEach( ( item, index )=> {
                if( item.type === 'Sprite' ) {
                    const raycaster2 = new THREE.Raycaster( 
                        new THREE.Vector3( item.position.x, 100, item.position.z ), 
                        new THREE.Vector3( 0, -1, 0 ) 
                    )
            
                    const intersects = raycaster2
                        .intersectObject( this.terrainBody.threemesh.children[ 0 ] )
            
                    if( intersects.length > 0 ) {
                        item.position.setY(
                            intersects[ 0 ].point.y + this.config['objects']['offsetY']
                        )

                    } else {
                        // console.log( 'objects are not visible' )
                    }
                }

        } )
    }


    updateMeshPosition( { x, y, z } ) {
        this.mesh.position.set( 
            x,
            y,
            z
        )

       // this.mesh.lookAt( new Vector3( x, y, z ) )
    }



    checkUrlParams() {
        let params = window.location.search
            .slice( 1 )
            .split( '&' )
            .reduce( ( acc, a, index ) => {
                const [ key, value ] = a.split( '=' )
                acc.push( [ key, decodeURIComponent( value ).toLowerCase() ] )
                return acc
            }, [] )

        const _default = {
            'x': this.config['camera']['perspective']['start']['x'],
            'y': this.config['camera']['perspective']['start']['y'],
            'z': this.config['camera']['perspective']['start']['z']
        }

        const pos = {}
        let change = false
        const keys = Object.keys( _default )
        Object
            .entries( _default )
            .forEach( a => {
                const [ search, value ] = a
                const result = params.find( b => b[ 0 ] === search )
                // console.log( 'result', result )

                if( result === undefined ) {
                    change = true
                    params.push( [ search, value ] )
                    change 
                } else {
                    if( keys.includes( search ) ) {
                        // console.log( 'search', search )
                        // console.log( 'value', value )
                        // console.log( 'value', result[ 1 ] )
                        // console.log( '---' )
                        const index = params.findIndex( b => b[ 0 ] === search )
                        params[ index ] = [ search, parseFloat( result[ 1 ] ) ] //parseFloat( value )
                    } else {

                    } 
                }
            } )
        
        const str = params
            .filter( a => a[ 0 ] !== '' )
            .map( a => `${a[ 0 ]}=${a[ 1 ]}` )
            .join( '&' )

        if( change ) {
            window.history.replaceState( {} , 'test', `?${str}` )
        }


        Object
            .keys( _default )
            .forEach( key => {
                const value = params.find( a => a[ 0 ] === key )[ 1 ]
                this.config['camera']['perspective']['start'][ key ] = value
                this.config['userMesh']['positionMesh'][ key ] = value
            } )

        return params
    }


    async preload() {
        function statusInit( { cmds } ) {
            const status = Object
                .entries( cmds )
                .reduce( ( acc, a, index ) => {
                    if( index === 0 ) {
                        acc['total'] = 0,
                        acc['single'] = []
                    }
                    acc['single'].push( 0 )
                    return acc
                }, {} )
            
            loading.innerHTML = `<img src="assets/looki-looki.png" align="center"><br><span>Initialize 3D</span>`
            
            return status
        }


        function statusUpdate( { status, index=null, progress=null, length=null } ) {
            if( index !== null && !progress !== null ) {
                const percent = ( progress['loaded'] * 100 ) / progress['total'] 
                status['single'][ index ] = percent
            }

            status['total'] = status['single']
                .reduce( ( acc, a, index ) => {
                    if( index === status['single'].length - 1 ) {
                        acc = status['single']
                            .map( a => parseInt( a ) )
                            .reduce( ( abb, b, index ) => { return abb + b }, 0 )
                        // acc = Math.floor( ( p * 100 ) / ( status['single'].length * 100 ) ) 
                    }
                    return acc
                }, 0 )

            loading.innerHTML = `<img src="assets/looki-looki.png" align="center"><br><span>Loading Assets:</span> ${status['total']} %`
            // info.innerHTML = `<span>Loading Assets:</span> ${status['total']} %`

            return status
        }
 

        function statusFinished( { status } ) {
            status['single'] = status['single']
                .map( a => 100 )

            console.log( 'Mina state:', walletMina.state )

            let startMetaverse
            let minaAccountInject = ''
            let minaAddressField = ''
            if( walletMina.state.available ) {
                minaAccountInject = ' onClick="walletMina.accountConnect().then( a => walletMina.accountResponse( a ) )" '
                minaAddressField = '<input id="mina_address" class="c-form__input" placeholder="Address" pattern="/^B62[a-zA-Z0-9]{52}$/g" >'
            
                startMetaverse = "walletMina.accountConnect().then( a => walletMina.accountResponse( a ) )"
            } else {
                startMetaverse = "onClick=\"metaverse.withUserName( { 'userName': document.getElementById('user_name' ).value } )\""
             //  startMetaverse = 'onClick=\"console.log(\'triggert\') \"'
             startMetaverse = "metaverse.withUserName( { 'userName': document.getElementById('user_name' ).value } )"
            }

            status = statusUpdate( { status } )
            loading.innerHTML= `
                <img src="assets/looki-looki.png" align="center">
                
                <input class="c-checkbox" type="checkbox" id="checkbox">
                <div class="c-formContainer">
                    <form class="c-form" action="" >
                        <input id="user_name" type="text" class="c-form__input" placeholder="Your Name" required>

                        <label class="c-form__toggle" for="checkbox" data-title="GET STARTED"></label>

                        <label class="c-form__buttonLabel" for="checkbox" >
                            <button id="metaverse_start" class="c-form__button" type="button" onClick="${startMetaverse}" >START</button>
                        </label>
                        
                        <label class="c-form__toggle" for="checkbox" data-title="GET STARTED"></label>
                    </form>
                </div>
            `

          //  document.getElementById( 'metaverse_start' ).disable = true

            return status
        }


        const struct = {
            'textures': [],
            'gltf': [],
            'json': []
        }

        struct['textures'] = Object
            .keys( this.config['assets']['textures'] )
            .map( key => {
                const result = {
                    'key': key,
                    'value': this.config['assets']['textures'][ key ]
                }

                return result
            } )

        struct['gltf'] = [
            {
                'key': 'userMesh',
                'value': this.config['assets']['mesh'][ this.config['assets']['mesh']['userMesh'] ]
            }
        ]
        
        struct['json'] = [
            {
                'key': 'terrain',
                'value': this.config['assets']['heightmap']['local']
            },
            {
                'key': 'fromServer',
                'value': this.config['assets']['datas']['objects']
            },
            {
                'key': 'standings',
                'value': this.config['assets']['datas']['standings']
            }            
        ]
        
        const cmds = Object
            .keys( struct )
            .reduce( ( acc, key, index ) => {
                struct[ key ]
                    .forEach( ( cmd, index ) => {
                        acc[ `${key}__${cmd['key']}` ] = cmd['value']
                    } )

                return acc
            }, {} )

        this.preloadStatus = statusInit( { cmds } )
        console.log( 'start', this.preloadStatus )

        const loads = await Promise.all( 
            Object
                .entries( cmds )
                .map( ( cmd, index ) => {
                    const [ type, name ] = cmd[ 0 ].split( '__' )
                    const url = cmd[ 1 ]
    
                    let loader = null
                    switch( type ) {
                        case 'textures':
                            loader = new THREE.TextureLoader()
                            return new Promise( ( resolve, reject ) => {
                                loader.load(
                                    url,
                                    texture => resolve( texture ),
                                    progress => { 
                                        this.preloadStatus = statusUpdate( { 
                                            'status': this.preloadStatus, 
                                            index, 
                                            progress,
                                            'length': Object.keys( cmds ).length
                                        } )
                                    },  // onProgress callback not supported from r84
                                    err => reject( err )
                                )
                            } )
                            break
                        case 'gltf':
                            loader = new THREE.GLTFLoader()
                            return new Promise( ( resolve, reject ) => {
                                loader.load(
                                    url,
                                    gltf => resolve( gltf ),
                                    progress => {
                                        this.preloadStatus = statusUpdate( { 
                                            'status': this.preloadStatus, 
                                            index, 
                                            progress,
                                            'length': Object.keys( cmds ).length
                                        } )
                                    }, // onProgress callback not supported from r84
                                    err => reject( err )
                                )
                            } )
                            break
                        case 'json':
                            return new Promise( ( resolve, reject ) => {
                                fetch( url )
                                    .then( ( response ) => response.json() )
                                    .then( json => resolve( json ) )
                                    .catch( err => reject( err ) )
                            } )
                            break
                    }
                } )
        )

        this.preloadStatus = statusFinished( { 
            'status': this.preloadStatus 
        } )

        this.preloads = Object
            .entries( cmds )
            .reduce( ( acc, cmd, index ) => {
                acc[ cmd[ 0 ] ] = loads[ index ]
                return acc
            }, {} )

        return true
    }

/*
    refresh( cmd ) {
        console.log( cmd )
        this.init()
    }
*/
    addRenderer() {
        this.renderer = new THREE.WebGLRenderer( { 
            'antialias': this.config['renderer']['antialias'],
            'alpha': this.config['renderer']['alpha'] 
        } )

        this.renderer.autoClear = this.config['renderer']['autoClear']

        this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.renderer.shadowMap.enabled = this.config['renderer']['shadowMap']
        this.renderer.shadowMapSoft = this.config['renderer']['shadowMapSoft']
        this.renderer.shadowMapType = this.config['renderer']['shadowMapType']

        document.body.appendChild( this.renderer.domElement )
    }


    addHUD() {
        const keys = [ 'min', 'max', 'init' ]

        /*
        const terrainRange = [ 'x', 'y', 'z' ]
            .reduce( ( abb, pos, rindex ) => {
                const value = this.terrainBody.threemesh.children
                    .reduce( ( acc, child, index ) => {
                        const items = child.geometry.vertices
                            .map( a => a[ pos ] )
                        keys
                            .forEach( key => {
                                switch( key ) {
                                    case 'min': 
                                        acc[ key ] = Math.min( ...items )
                                        break
                                    case 'max':
                                        acc[ key ] = Math.max( ...items )
                                        break
                                    case 'init':
                                        acc[ key ] = this.terrainBody.initPosition[ pos ]
                                } 
                            } )

                        if( acc['min'] > acc['init'] ) {
                            acc['offset'] = -( acc['min'] - acc['init'] )
                        } else {
                            acc['offset'] = acc['init'] - acc['min']
                        }

                        acc['from'] = acc['min'] + acc['offset']
                        acc['to'] = acc['from'] + ( acc['max'] - acc['min'] )

                        return acc
                    }, {} )

                abb[ pos ] = value
                return abb
            }, {} )

        console.log( 'range', terrainRange )
        */
        
        this.hud = new HUD() 
        this.hud.init( { 
            'landscapeTexture': this.preloads['textures__landscape'],
            'redDotTexture': this.preloads['textures__redDot'],
            'blueDotTexture': this.preloads['textures__blueDot'],
            'greenDotTexture': this.preloads['textures__greenDot'],
            'greyDotTexture': this.preloads['textures__greyDot'],
            'userX': this.mesh.position.x,
            'userY': this.mesh.position.z,
            'terrainBounding': this.config['landscape']['heightmap']['bounding']
        } )

        const user = this.hud.addPoint( {
            'id': 'user',
            'type': 'red',
            'x': this.mesh.position.x,
            'y': this.mesh.position.z
        } )

        this.sceneOrthographic.add( user )
        this.sceneOrthographic.add( this.hud.landscape )
    }


    addStandings() {
        this.standings = new Standings()
        this.standings.init( {
            'userId': this.state['socket']['userId'], 
            'dataset': this.preloads['json__standings']
        } )

        this.standings.createBoard()
        //const board = this.standings.createBoard( {} )
    }


    addScene() {
        this.scenePerspective = new THREE.Scene()
        this.scenePerspective.background = new THREE.Color( 0x0d0627 );

        this.sceneOrthographic = new THREE.Scene()

        const width = window.innerWidth
        const height = window.innerHeight

        this.cameraPerspective = new THREE.PerspectiveCamera( 
            this.config['camera']['perspective']['fov'], 
            width / height, 
            this.config['camera']['perspective']['near'],
            this.config['camera']['perspective']['far']
        )

        this.cameraOrthographic = new THREE.OrthographicCamera( 
            - width / 2,
            width / 2, 
            height / 2, 
            - height / 2, 
            this.config['camera']['perspective']['near'],
            this.config['camera']['perspective']['far']
        )
        this.cameraOrthographic.position.z = this.config['camera']['orthographic']['z']
        

        this.cameraPerspective.position.set( 
            this.config['camera']['perspective']['offset']['x'], 
            this.config['camera']['perspective']['offset']['y'],
            this.config['camera']['perspective']['offset']['z'] 
        )

        this.cameraPerspective.lookAt( this.scenePerspective.position )
    }


    addPhysics() {
        this.world = new CANNON.World()

        this.world.broadphase = new CANNON.SAPBroadphase( this.world )
        this.world.gravity.set( 
            this.config['world']['gravity']['x'],
            this.config['world']['gravity']['y'],
            this.config['world']['gravity']['z']
        )

        this.world.defaultContactMaterial.friction = 
            this.config['world']['gravity']['contactMaterialFiction']

        const groundMaterial = new CANNON.Material( 'groundMaterial' )
        const wheelMaterial = new CANNON.Material( 'wheelMaterial' )
        const wheelGroundContactMaterial = new CANNON.ContactMaterial(
            wheelMaterial, 
            groundMaterial, 
            {
                'friction': this.config['world']['gravity']['contactMaterialFiction'],
                'restitution': this.config['world']['gravity']['restitution'],
                'contactEquationStiffness': this.config['world']['gravity']['contactEquationStiffness']
            }
        )

        this.world.addContactMaterial( wheelGroundContactMaterial )
    }


    addFrontAndBackLight() {
        const light1 = new THREE.DirectionalLight( 
            new THREE.Color( this.config['world']['light']['color'] ), 
            this.config['world']['light']['itensity'] 
        )

        light1.position
            .set( 
                this.config['world']['light']['x'],
                this.config['world']['light']['y'],
                this.config['world']['light']['z'] 
            )
            .normalize()

        this.scenePerspective.add( light1 )
    }


    addListenerResize() {
        window.addEventListener( 
            'resize', 
            () => {
                const width = window.innerWidth
                const height = window.innerHeight

                this.renderer.setSize( width, height )
                this.cameraPerspective.aspect = width / height
                this.cameraPerspective.updateProjectionMatrix()

                this.cameraOrthographic.left = - width / 2
				this.cameraOrthographic.right = width / 2
				this.cameraOrthographic.top = height / 2
				this.cameraOrthographic.bottom = - height / 2
				this.cameraOrthographic.updateProjectionMatrix()

                // this.hud.updateDisplay()
                // this.hud.update()

                if( this.standings !== undefined ) {
                    this.standings.resizeWindow()
                }

                if( this.hud !== undefined ) {
                    this.hud.addListenerWindowResize( { 
                        'x': this.mesh.position.x,
                        'y': this.mesh.position.z
                    } )
                } else {
                    console.log( `this.hud not available`)
                }

            }
        )

        return true
    }


    addEffects() {
        const hTilt = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader )
        hTilt.enabled = this.config['renderer']['shader']['hTiltEnabled']
        hTilt.uniforms.h.value = 4 / ( this.config['renderer']['scale'] * window.innerHeight )

        const renderPass = new THREE.RenderPass( this.scenePerspective, this.cameraPerspective )
        const effectCopy = new THREE.ShaderPass( THREE.CopyShader )
        effectCopy.renderToScreen = this.config['renderer']['shader']['renderToScreen']

        this.composer = new THREE.EffectComposer( this.renderer )
        this.composer.addPass( renderPass )
        this.composer.addPass( hTilt )
        this.composer.addPass( effectCopy )
    }


    addControls() {
        this.gui = new GuiInterface()
        this.gui.init( { 
            'show': this.config['controls']['gui']['show'],
            'config': this.config
        } )
    }


    addModifyThreeDefault() {
        Object.defineProperties( 
            THREE.Object3D.prototype, 
            {
                'x': {
                    get: () => this.position.x,
                    set: ( v ) => this.position.x = v
                },
                'y': {
                    get: () => this.position.y,
                    set: ( v ) => this.position.y = v
                },
                'z': {
                    get: () => this.position.z,
                    set: ( v ) => this.position.z = v
                },
                'rotationZ': {
                    get: () => this.rotation.x,
                    set: ( v ) => this.rotation.x = v
                },
                'rotationY': {
                    get: () => this.rotation.y,
                    set: ( v ) => this.rotation.y = v
                },
                'rotationX': {
                    get: () => this.rotation.z,
                    set: ( v ) => this.rotation.z = v
                }
            }
        )
    }


    addMeshAstronaut() {
        this.geometry = new THREE.BoxBufferGeometry( 
            this.config['userMesh']['box']['x'],
            this.config['userMesh']['box']['y'],
            this.config['userMesh']['box']['z']
        )

        this.geometry.applyMatrix( 
            new THREE.Matrix4().makeTranslation( 
                this.config['userMesh']['translate']['x'],
                this.config['userMesh']['translate']['y'],
                this.config['userMesh']['translate']['z']
            ) 
        )

        const material = new THREE.MeshNormalMaterial( { 
            'transparent': this.config['userMesh']['transparent'], 
            'opacity': this.config['userMesh']['opacity']
        } )

        material.visible = false

        this.mesh = new THREE.Mesh( this.geometry, material )
        // console.log( 'mesh', this.mesh )
        this.scenePerspective.add( this.mesh )

        var light2 = new THREE.DirectionalLight( 
            new THREE.Color( this.config['userMesh']['light']['color'] ),
            this.config['userMesh']['light']['intensity']
        )

        light2.position.set( 
            this.config['userMesh']['light']['x'], 
            this.config['userMesh']['light']['y'], 
            this.config['userMesh']['light']['z']
        )

        light2.castShadow = this.config['userMesh']['light']['castShadow']
        light2.target = this.mesh
        this.mesh.add( light2 )

        this.mixers = []
        this.clip1
        this.clip2
        this.clip3

        const object = this.preloads['gltf__userMesh']
        object 
            .scene
            .traverse( ( node ) => {
                    if ( node instanceof THREE.Mesh ) { 
                        node.castShadow = this.config['userMesh']['light']['castShadow']
                        node.material.side = THREE.DoubleSide
                    }
                } 
            )

        const player = object.scene

        player.position.set( 
            this.config['userMesh']['positionPlayer']['x'],
            this.config['userMesh']['positionPlayer']['y'],
            this.config['userMesh']['positionPlayer']['z']
        )

        player.scale.set( 
            this.config['userMesh']['scale']['x'],
            this.config['userMesh']['scale']['y'],
            this.config['userMesh']['scale']['z']
        )

        this.mesh.position.x = this.config['userMesh']['positionMesh']['x']
        this.mesh.position.y = this.config['userMesh']['positionMesh']['y']
        this.mesh.position.z = this.config['userMesh']['positionMesh']['z']

        this.mesh.add( player )

        const mixer = new THREE.AnimationMixer( player )
        this.clip1 = mixer.clipAction( object.animations[ 0 ] )
        this.clip2 = mixer.clipAction( object.animations[ 1 ] )
        this.mixers.push( mixer )
    }


    async addTerrain() {
        const startPosition = new CANNON.Vec3( 
            this.config['landscape']['heightmap']['start']['x'],
            this.config['landscape']['heightmap']['start']['y'],
            this.config['landscape']['heightmap']['start']['z']
        )

        let matrix = ''
        if( this.config['assets']['heightmap']['precalculated'] ) {
            !this.silent ? console.log( '- Terrain precalculated' ) : ''
            // matrix = eval( this.config['assets']['heightmap']['localVar'] )
            matrix = this.preloads['json__terrain']['data']
        } else {
            !this.silent ? console.log( '- Terrain realtime' ) : ''
            matrix = await this.img2matrix(
                this.config['assets']['heightmap']['png'], 
                this.config['landscape']['heightmap']['size']['x'], 
                this.config['landscape']['heightmap']['size']['y'],
                this.config['landscape']['heightmap']['height']['min'], 
                this.config['landscape']['heightmap']['height']['max']
            )
        }

        const terrainShape = new CANNON.Heightfield( 
            matrix, 
            { 'elementSize': this.config['landscape']['heightmap']['elementSize'] } 
        )

        this.terrainBody = new CANNON.Body( {
            'mass': this.config['landscape']['heightmap']['mass']
        } )

        this.terrainBody.addShape( terrainShape )

        this.terrainBody.position.set( 
            this.config['landscape']['heightmap']['position']['x'],
            this.config['landscape']['heightmap']['position']['y'],
            this.config['landscape']['heightmap']['position']['z']
        )
    
        this.terrainBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3( 1, 0, 0 ), 
            -Math.PI / 2
        )
    
        this.world.add( this.terrainBody )
        // this.helper.addVisual( this.terrainBody, 'landscape' )
        this.addTerrainCannon( 'landscape' )
    
        const raycastHelperGeometry = new THREE.CylinderGeometry( 0, 1, 5, 1.5 )
        raycastHelperGeometry.translate( 0, 0, 0 )
        raycastHelperGeometry.rotateX( Math.PI / 2 )
        this.raycastHelperMesh = new THREE.Mesh( 
            raycastHelperGeometry, 
            new THREE.MeshNormalMaterial()
        )

        this.scenePerspective.add( this.raycastHelperMesh )
    }


    addTerrainCannon( name ) {
         this.terrainBody .name = name

        if( this.currentMaterial === undefined ) {
            this.currentMaterial = new THREE.MeshLambertMaterial( { 
                'color': this.config['landscape']['material']['color']
            } )
        }

        let meshTerrain
        if( this.terrainBody instanceof CANNON.Body ) {
            meshTerrain = new THREE.Object3D()
            const material = this.currentMaterial
            const game = this
            let index = 0

            this.terrainBody.shapes
                .forEach( ( shape ) => {
                    let mesh    
                    let geometry = new THREE.Geometry()
                    
                    let v0 = new CANNON.Vec3()
                    let v1 = new CANNON.Vec3()
                    let v2 = new CANNON.Vec3()

                    shape.data
                        .forEach( ( a, xi ) => {
                            if( xi < shape.data.length - 1 ) {
                                shape.data[ xi ]
                                    .forEach( ( b, yi ) => {
                                        if( yi < shape.data[ xi ].length - 1 ) {
                                            const n = new Array( 2 )
                                                .fill()
                                                .forEach( ( c, k ) => {
                                                    shape.getConvexTrianglePillar( xi, yi, k===0 )
                                                    v0.copy( shape.pillarConvex.vertices[ 0 ] )
                                                    v1.copy( shape.pillarConvex.vertices[ 1 ] )
                                                    v2.copy( shape.pillarConvex.vertices[ 2 ] )
                                                    v0.vadd( shape.pillarOffset, v0 )
                                                    v1.vadd( shape.pillarOffset, v1 )
                                                    v2.vadd( shape.pillarOffset, v2 )
                                                    geometry.vertices.push(
                                                        new THREE.Vector3( v0.x, v0.y, v0.z ),
                                                        new THREE.Vector3( v1.x, v1.y, v1.z ),
                                                        new THREE.Vector3( v2.x, v2.y, v2.z )
                                                    );
                                                    var i = geometry.vertices.length - 3;
                                                    geometry.faces.push( new THREE.Face3( i, i + 1, i + 2 ) );
                                                } )
                                        }
                                    } )
                            }
                        } )

                    geometry.computeBoundingSphere()
                    geometry.computeFaceNormals()

                    this.addTerrainCannonCreateGradient( geometry )

                    var mat = new THREE.MeshLambertMaterial( {
                        'vertexColors': THREE.VertexColors,
                        'wireframe': this.config['landscape']['wireframe']
                    } )
    
                    mesh = new THREE.Mesh( geometry, mat )

                    mesh.receiveShadow = this.config['landscape']['receiveShadow']
                    mesh.castShadow = this.config['landscape']['castShadow']
    
                    mesh
                        .traverse( ( child ) => {
                            if( child.isMesh ) {
                                child.castShadow = this.config['landscape']['castShadow']
                                child.receiveShadow = this.config['landscape']['receiveShadow']
                            }
                        } )
    
                    const o = this.terrainBody.shapeOffsets[ index ]
                    const q = this.terrainBody.shapeOrientations[ index++ ]
                    mesh.position.set( o.x, o.y, o.z )
                    mesh.quaternion.set( q.x, q.y, q.z, q.w )
    
                    meshTerrain.add( mesh )
                } )
        }

        if( meshTerrain ) {
            this.terrainBody.threemesh = meshTerrain
            meshTerrain.castShadow = this.config['landscape']['castShadow']
            meshTerrain.receiveShadow = this.config['landscape']['receiveShadow']
            this.scenePerspective.add( meshTerrain )
        }
    }


    addTerrainCannonCreateGradient( geometry ) {
        const colors = this.config['landscape']['gradient']['colors']
            .map( a => { return { 'stop': a[ 0 ], 'color': new THREE.Color( a[ 1 ] ) } } )

        geometry.computeBoundingBox()

        const bbox = geometry.boundingBox
        const size = new THREE
            .Vector3()
            .subVectors( bbox.max, bbox.min )

        const vertexIndices = [ 'a', 'b', 'c' ]
        var face, vertex, normalized = new THREE.Vector3(), normalizedAxis = 0

        colors
            .forEach( ( a, c ) => {
                if( c < colors.length - 1 ) {
                    const colorDiff = colors[ c + 1 ].stop - colors[ c ].stop
                    const m = new Array( geometry.faces.length )
                        .fill()
                        .forEach( ( b, i ) => {
                            face = geometry.faces[ i ]
                            const n = new Array( 3 )
                                .fill()
                                .forEach( ( z, v ) => {
                                    vertex = geometry.vertices[ face[ vertexIndices[ v ] ] ]
                                    normalizedAxis = normalized
                                        .subVectors( vertex, bbox.min )
                                        .divide( size )[ this.config['landscape']['gradient']['axis'] ]

                                    if( this.config['landscape']['gradient']['reverse'] ) {
                                        normalizedAxis = 1 - normalizedAxis
                                    }
                                    if( normalizedAxis >= colors[ c ].stop && normalizedAxis <= colors[ c + 1 ].stop ) {
                                        var localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff
                                        face.vertexColors[ v ] = colors[ c ]
                                            .color
                                            .clone()
                                            .lerp( 
                                                colors[ c + 1 ].color, 
                                                localNormalizedAxis 
                                            )
                                    }
                                } )
                        } )
                }
            } )
    }


    addSkyParticles() {
        var randnum = ( min, max ) => {
            return Math.round( Math.random() * ( max - min ) + min )
        }

        const textureLoader = new THREE.TextureLoader()
        textureLoader.crossOrigin = ''

        const imageSrc = this.preloads['textures__snowflake']
        const shaderPoint = THREE.ShaderLib.points

        const uniforms = THREE.UniformsUtils.clone( shaderPoint.uniforms )
        uniforms.map.value = imageSrc

        const matts = new THREE.PointsMaterial( {
            'size': this.config['world']['particles']['size'],
            'color': new THREE.Color( this.config['world']['particles']['color'] ),
            'map': uniforms.map.value,
            'blending': this.config['world']['particles']['blending'],
            'depthWrite': this.config['world']['particles']['depthWrite'] ,
            'transparent': this.config['world']['particles']['transparent'],
            'opacity': this.config['world']['particles']['opacity']
        } )

        const geo = new THREE.Geometry()
        const n = new Array( this.config['world']['particles']['totalStars'] )
            .fill()
            .forEach( () => {
                const star = new THREE.Vector3()
                geo.vertices.push( star )
            } )

        const sparks = new THREE.Points( geo, matts )
        sparks.scale.set( 
            this.config['world']['particles']['scale'], 
            this.config['world']['particles']['scale'], 
            this.config['world']['particles']['scale'] 
        )

        this.scenePerspective.add( sparks )

        sparks.geometry.vertices
            .map( ( d, i ) => {
                const n = [ 'y', 'x', 'z' ]
                    .forEach( ( key, rindex ) => {
                        d[ key ] = randnum( 
                            this.config['world']['particles']['random'][ rindex ][ 0 ], 
                            this.config['world']['particles']['random'][ rindex ][ 1 ] 
                        )
                    } )
            } )
    }


    addMeshFlag( { cmd }  ) {
 
        const geometry1 = new THREE.BoxBufferGeometry( 
            cmd['flag']['width'], 
            cmd['flag']['height'], 
            cmd['flag']['depth'] 
        )

        geometry1.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 1, 0 ) )
        const material1 = new THREE.MeshNormalMaterial( { 
            'transparent': cmd['flag']['transparent'], 
            'opacity': cmd['flag']['opacity']
        } )

        // this.pos.push( new THREE.Mesh( geometry1, material1 ) )
        const mesh = new THREE.Mesh( geometry1, material1 )

        // this.pos[ this.pos.length-1 ].position.x = cmd['flag']['position']['x']
        mesh.position.x = cmd['flag']['position']['x']

        // this.pos[ this.pos.length-1 ].position.z = cmd['flag']['position']['z']
        mesh.position.z = cmd['flag']['position']['z']

        // this.pos[ this.pos.length-1 ].rotateY( Math.PI )
        mesh.rotateY( Math.PI )

        //console.log( '>>', intersects)

        const pointflagLight = new THREE.PointLight( 
            new THREE.Color( cmd['light']['point']['color'] ), 
            cmd['light']['point']['intensity'], 
            cmd['light']['point']['decay']
        )

        pointflagLight.position.set( 0, 0, 0 )
        mesh.add( pointflagLight )

        

        const directional = new THREE.DirectionalLight( 
            new THREE.Color( cmd['light']['directional']['color'] ), 
            cmd['light']['directional']['itensity']
        )

        directional.position.set( 0, 0, 0 )  
        directional.castShadow = cmd['light']['directional']['castShadow']

        directional.target = pointflagLight 
        

        this.scenePerspective.add( mesh )
        this.scenePerspective.add( directional )
        
        /*
        const geometry2 = new THREE.CylinderGeometry( 
            cmd['cylinder']['radiusTop'],
            cmd['cylinder']['radiusBottom'],
            cmd['cylinder']['height'],
            cmd['cylinder']['radialSegments']
        )

        const material2 = new THREE.MeshPhongMaterial( { 
            'color': new THREE.Color( cmd['cylinder']['color'] )
        } )

        const cylinder = new THREE.Mesh( geometry2, material2 )
        cylinder.geometry.center()
        cylinder.castShadow = cmd['cylinder']['castShadow']

       // mesh.add( cylinder )
       */






    /*
        const texture = this.preloads['textures__flag']
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry( 
                cmd['plane']['width'],
                cmd['plane']['height'],
                cmd['plane']['widthSegments'],
                cmd['plane']['heightSegments'],
                true
            ), 
            new THREE.MeshBasicMaterial( { 
                'map': texture, 
                'side': THREE.DoubleSide
            } ) 
        )

        plane.scale.set( 
            cmd['plane']['scale']['x'],
            cmd['plane']['scale']['y'],
            cmd['plane']['scale']['z']
        )

        cmd['plane']['scale']['x'] = 0
        cmd['plane']['scale']['y'] = 1.5
        cmd['plane']['scale']['z'] = 0

        plane.position.set( 
            cmd['plane']['position']['x'],
            cmd['plane']['position']['y'],
            cmd['plane']['position']['z']
        )
        plane.position.x = .75
        plane.castShadow = cmd['plane']['position']['castShadow']

        this.pos[ this.pos.length-1 ].add( plane )
        */
    }


    updateActivations( { deactivate=[], activate=[] } ) {
        this.hud.updateActivationsPoint( { 
            deactivate, 
            activate
        } )

        this.updateActivationsSprite( { 
            deactivate, 
            activate
        } )
    }


    updateActivationsSprite( { deactivate=[], activate=[] } ) {
        const sprites = this.scenePerspective.children
            .filter( a => a['type'] === 'Sprite' )

        deactivate
            .forEach( cmd => {
                const id = cmd['id']
                const material = this.getMaterial( { 'status': 'found', 'chain': cmd['chain'] } )
                const sprite = sprites.find( a => a['name'] === id )
                sprite['material'] = material
            } )

        activate
            .forEach( cmd => {
                const id = cmd['id']
                const material = this.getMaterial( { 'status': 'active', 'chain': cmd['chain'] } )
                const sprite = sprites.find( a => a['name'] === id )
                sprite['found'] = false
                sprite['material'] = material
            } )
    }


    raycastMouseMovement( event ) {
        const result = {
            'found': false,
            'vector3': null
        }

        const pointer = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()

        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
        pointer.y = -( event.clientY / window.innerHeight ) * 2 + 1
  
        raycaster.setFromCamera( pointer, this.cameraPerspective )
        const intersects = raycaster.intersectObjects( this.scenePerspective.children )
  
        if( intersects.length > 0 ) {
            const sprites = intersects.filter( a => a['object']['type'] === 'Sprite' )

            if( sprites.length > 0 ) {
                result['found'] = true
                result['vector3'] = sprites[ 0 ]['object']['position']
            }
         // intersects[ 0 ].object.material.color.set( 0xff0000 )
        }

        return result
    }


    raycastIntersect() {
        const raycaster = new THREE.Raycaster( 
            this.mesh.position, 
            new THREE.Vector3( 0, -1, 0 ) 
        )

        const intersects = raycaster
            .intersectObject( this.terrainBody.threemesh.children[ 0 ] )

        if( intersects.length > 0 ) {
            this.raycastHelperMesh.position.set( 0, 0, 0 )
            this.raycastHelperMesh.lookAt( intersects[ 0 ].face.normal )
            this.raycastHelperMesh.position.copy( intersects[ 0 ].point )
        }

        if( intersects && intersects[ 0 ] ) {
            this.mesh.position.y = intersects[ 0 ].point.y + 0.1
        } else {
            this.mesh.position.y = 50
            //console.log( 'outside of terrain.' )
            this.cameraPerspective.position.x = this.config['camera']['perspective']['start']['x']
            this.cameraPerspective.position.y = this.config['camera']['perspective']['start']['y']
            this.cameraPerspective.position.z = this.config['camera']['perspective']['start']['z']
        }

        const raycaster2 = new THREE.Raycaster();
        raycaster2.setFromCamera( 
            new THREE.Vector3( 0, 0, 1 ), 
            this.cameraPerspective
        )

        const intersects2 = raycaster2
            .intersectObjects( this.scenePerspective.children )

        const sprites = intersects2
            .filter( a => a['object']['type'] === 'Sprite' )

        if( sprites.length > 0 ) {
            if( sprites[ 0 ].distance < 10 ) {
                // console.log( 'INSIDE', sprites[ 0 ] )

                if( sprites[ 0 ]['object']['found'] !== true ) {
                    const id = sprites[ 0 ]['object'].name

                    console.log( '🎉 Object catched', id )

                    this.updateActivations( { 'deactivate': [ { 'id': id } ] } )
                    console.log( 'lol', `/found/${id}/${this.socket['id']}` )
                    
                    fetch( 
                        `/found/${id}/${this.state['socket']['userId']}`, 
                        {
                            'method': 'POST',
                            'headers': {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            'body': JSON.stringify( {} )
                        }
                    )
                        .then( response => response.json() )
                        .then( message => { 
                            console.log( 'Response', message ) 
                            if( message['points'] !== null ) {
                                if( message['points'] === 10 ) {
                                    if( walletMina.state.available ) {
                                        return walletMina.generateReceipt()
                                    } else {
                                        console.log( 'Mina is not set.' )
                                    }
                                    
                                } else {
                                    return ''
                                }
                            }
                        } )
                        .catch( e => console.log( e ) )

                  /*
                    const found = this.sceneOrthographic.children
                        .find( a => a['name'] === sprites[ 0 ]['object'].name  )
                   // sprites[ 0 ]['object']['material']['opacity'] = 0.2
                    console.log( 'TEST', found.material.opacity = 0.2)
                  */

                  sprites[ 0 ]['object'].found = true
                } else {
                    // console.log( 'Not changed' )
                }

            }
            
        }

  /*
        const collect = raycaster.intersectObjects( this.scenePerspective.children )
        if( collect.length > 0 ) {
            console.log( 'points', collect[ 0 ] )

        }
        */

/*
        const raycaster2 = new THREE.Raycaster( 
            this.cameraPerspective.position, 
            new THREE.Vector3( 0, -1, 0 ) 
        )

        const intersects2 = raycaster2
            .intersectObject( this.terrainBody.threemesh.children[ 0 ] )

        if( intersects2 && intersects2[ 0 ] ) {
        } else {
          //  this.cameraPerspective.position.x = this.config['camera']['perspective']['start']['x']
          //  this.cameraPerspective.position.y = this.config['camera']['perspective']['start']['y']
          //  this.cameraPerspective.position.z = this.config['camera']['perspective']['start']['z']
        }

*/


        if( !state['pos']['found'] ) {
            this.pos
                .forEach( ( mesh, index ) => {
                    const raycaster2 = new THREE.Raycaster( 
                        this.pos[ index ].position, 
                        new THREE.Vector3( 0, -1, 0 ) 
                    )
            
                    const intersects2 = raycaster2
                        .intersectObject( this.terrainBody.threemesh.children[ 0 ] )
            
                    if( intersects2 && intersects2[ 0 ] ) {
                        state['pos']['found'] = true
                        this.pos[ index ].position.y = intersects2[ 0 ].point.y + .5
                    } else {
                        this.pos[ index ].position.y = 30
                    }
            
                    // this.posLight[ index ].position.y = this.pos[ index ].position.y + 50
                    // this.posLight[ index ].position.x = this.pos[ index ].position.x + 5
                    // this.posLight[ index ].position.z = this.pos[ index ].position.z
                } )
        }
    }


    async img2matrix( url, width, depth, minHeight, maxHeight ) {    
        function fromImage ( image, width=0, depth=0, minHeight, maxHeight ) {
            const canvas = document.createElement( 'canvas' )
            const ctx = canvas.getContext( '2d' )

            let channels = 4
            let heightRange = maxHeight - minHeight
    
            canvas.width = width
            canvas.height = depth
    
            ctx.drawImage( image, 0, 0, width, depth )
            const imgData = ctx.getImageData( 0, 0, width, depth ).data

            const matrix = new Array( depth )
                .fill()
                .map( ( a, index ) => {
                    const row = new Array( width )
                        .fill()
                        .map( ( b, rindex )  => {
                            const pixel = index * depth + rindex
                            const heightData = imgData[ pixel * channels ] / 255 * heightRange + minHeight
                            return heightData
                        } )
                    return row
                } )
    
            return matrix
        }


        async function fromUrl( url, width, depth, minHeight, maxHeight ) {
            return new Promise( ( resolve, reject ) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.onload = () => {
                    const matrix = fromImage( img, width, depth, minHeight, maxHeight )
                    resolve( matrix )
                }
                img.onerror = ( e ) => reject( e )

                img.src = url
            })
        }

        const matrix = await fromUrl( url, width, depth, minHeight, maxHeight )
        return matrix
    }


    updateCamera() {
        if( this.followCam ) {
            this.cameraPerspective.position.lerp( 
                this.followCam.getWorldPosition( new THREE.Vector3() ), 
                this.config['camera']['perspective']['lerp'] 
            )
        
            this.cameraPerspective.lookAt( 
                this.mesh.position.x, 
                this.mesh.position.y + this.config['camera']['perspective']['lookAt'], 
                this.mesh.position.z
            )
        }
    }

 
    updateDrive() {     
        const force = this.config['controls']['joystick']['maxForce'] * state['joystick']['forward']
        const steer =  this.config['controls']['joystick']['maxSteerVal'] * state['joystick']['turn']
    
        if( state['joystick']['forward'] != 0 ) {
            this.mesh.translateZ( force )
            if( this.clip2 ) this.clip2.play()
            if( this.clip1 ) this.clip1.stop()
        } else {
            if( this.clip2 ) this.clip2.stop()
            if( this.clip1 ) this.clip1.play()
        }
        this.mesh.rotateY( steer )
    }


    updateWorldBodies() {
        this.world.bodies
            .forEach( function( body ) {
                if( body.threemesh != undefined ) {
                    body.threemesh.position.copy( body.position )
                    body.threemesh.quaternion.copy( body.quaternion )
                }
            } )
    }


    updateUserMap() {
        this.hud.updatePoint( {
            'id': 'user',
            'x': this.mesh.position.x,
            'y': this.mesh.position.z
        } )
    }



    animate() {
        setTimeout( () => {
            requestAnimationFrame( this.animate.bind( this ) )
            this.index++

            if( this.index === 100 ) {
                // console.log( 'SET' )
                this.updateObjectsY()
                //this.addObjects()
            }

            this.updateCamera()
            this.updateDrive() 
            this.updateUserMap()

            this.renderer.clear()
            this.renderer.render( this.scenePerspective, this.cameraPerspective )
            this.renderer.clearDepth()
            this.renderer.render( this.sceneOrthographic, this.cameraOrthographic )
            // this.composer.render()
        
            let delta = this.clock.getDelta()
            this.mixers
                .forEach( ( a ) => a.update( delta ) )   
    
            const now = Date.now()
            if( this.lastTime === undefined ) this.lastTime = now
            const dt = ( Date.now() - this.lastTime ) / 1000.0
            this.lastTime = now
        
            this.world.step( this.config['renderer']['fixedTimeStep'], dt )
            this.updateWorldBodies()
        

            if( this.raycastIntersect ) {
                this.raycastIntersect()
            }

            if( this.config['controls']['helper']['show'] ) {
                info.innerHTML = [
                    [ 'Server:', this.state['socket']['connectedSymbol'] ],
                    [ 'X: ', this.mesh.position.x.toFixed( 2 ) ],
                    [ 'Y: ', this.mesh.position.y.toFixed( 2 ) ],
                    [ 'Z: ', this.mesh.position.z.toFixed( 2 ) ],
                    [ 'FPS: ', dt * 1000 ]
                ]
                    .map( ( a, index ) => `<span id="${'view-' + index}">${a[ 0 ]}</span>${a[ 1 ]}` )
                    .join( ', &nbsp;&nbsp;&nbsp; ' )
            } else {
               info.innerHTML = ''
            }

    
        }, 1000 / 32 )
    }


    getIntersectionFromViewPoint( { distance } ) {
        var raycaster = new THREE.Raycaster()
        raycaster.setFromCamera( 
            new THREE.Vector2(), 
            this.cameraPerspective 
        )
        var inFrontOfCamera = new THREE.Vector3()
        const newPosition = raycaster.ray.at( 
            distance, 
            inFrontOfCamera 
        )

        const raycaster2 = new THREE.Raycaster( 
            newPosition, 
            new THREE.Vector3( 0, -1, 0 ) 
        )

        const intersects = raycaster2
            .intersectObject( this.terrainBody.threemesh.children[ 0 ] )

        const result = {
            'intersects': intersects,
            'newPosition': newPosition
        }

        return result
    }


    addAxisHelper() {
        const rays = this.getIntersectionFromViewPoint( { 
            'distance': this.config['axis']['distance']
        } )

        if( rays['intersects'] && rays['intersects'][ 0 ] ) {
            const axesHelper = new THREE.AxesHelper( this.config['axis']['size'] )

            axesHelper.position.set( 
                rays['newPosition'].x,
                rays['intersects'][ 0 ].point.y + this.config['axis']['offsetY'], 
                rays['newPosition'].z
            )
            this.scenePerspective.add( axesHelper )
        }
    }


    addInteractive() {
        const rays = this.getIntersectionFromViewPoint( { 
            'distance': this.config['sprites']['distance']
        } )

        if( rays['intersects'] && rays['intersects'][ 0 ] ) {
            const pointflagLight = new THREE.PointLight( 
                new THREE.Color( this.config['objects']['highlight']['point']['color'] ), 
                this.config['objects']['highlight']['point']['intensity'], 
                this.config['objects']['highlight']['point']['decay']
            )
                
            this.scenePerspective.add( pointflagLight )


            /*
            const material = new THREE.SpriteMaterial( { 
                'map': this.preloads['textures__nft'] 
            } )
*/

            const sprite = new THREE.Sprite( this.materials['nft_template'] )

            const pos = {
                'x': rays['newPosition'].x,
                'y': rays['intersects'][ 0 ].point.y + this.config['sprites']['offsetY'],
                'z': rays['newPosition'].z
            }

            sprite.position.set(  
                pos['x'],
                pos['y'], 
                pos['z']
            )

            sprite.center.set( 0.5, 0 )
            this.state['poi'].push( sprite )
            this.scenePerspective.add( 
                this.state['poi'][ this.state['poi'].length-1 ] 
            )

            const point = this.hud.addPoint( { 
                'id': `interactive__${this.state['poi'].length}`, 
                'x': pos['x'], 
                'y': pos['z'], 
                'type': 'blue' 
            } )

            this.state['poi'].push( point )

            this.sceneOrthographic.add( point )
        }
    }


    addObjectToMap( item ) {
        const point = this.hud.addPoint( { 
            'id': item['id'],
            'x': item['x'],
            'y': item['y'],
            'type': item['type']
        } )

        this.state['poi'].push( point )
        this.sceneOrthographic.add( point )
        this.sceneOrthographic.children[ metaverse.sceneOrthographic.children.length -1 ].name = item['id']
    }


    getMaterial( { status, chain } ) {
        let texture = null

        switch( status ) {
            case 'active':
                switch( chain ) {
                    case 'binance':
                        texture = this.preloads['textures__binance'] 
                        break
                    case 'polygon':
                        texture = this.preloads['textures__polygon']
                        break
                    case 'fantom':
                        texture = this.preloads['textures__fantom']
                        break
                }
                break
            case 'found':
                texture = this.preloads['textures__done']
                break
            default:
                break
        }

        const material = new THREE.SpriteMaterial( { 
            'map': texture
        } )

        return material
    }

    addObjectToTerrain( item ) {
        const material = this.getMaterial( { 
            'status': item['status'],
            'chain': item['chain']
        } )

        const sprite = new THREE.Sprite( material )
        sprite.position.set(  
            item['x'],
            item['intersectionY'] + this.config['objects']['offsetY'], 
            item['y']
        )

        sprite.center.set( 0.5, 0 )
        sprite.scale.set( 
            this.config['objects']['scaleX'],
            this.config['objects']['scaleY']
        )
        sprite.name = item['id']
        //  this.state['poi'].push( sprite )
        this.scenePerspective.add( sprite )
        this.scenePerspective.children[ metaverse.scenePerspective.children.length -1 ].name = item['id']
    }


    calculateNearestObjects() {
        this.state['nearestObjects'] = this.state['objects']['data']
            .map( ( a, index ) => {
                const to = new Vector3( a['x'], 0, a['y'], a['intersectionY'] )
                const struct = {
                    'id': a['id'],
                    'distance': this.mesh.position.distanceTo( to )
                }
                return struct
            } )
            .sort( ( a, b ) => a['distance'] - b['distance'] )
            .filter( ( a, index ) => index < this.config['objects']['nearest']['limit'] )
            .map( a => {
                const search = a['id']
                const result = this.state['objects']['data']
                    .find( a => a['id'] === search )
                result['distance'] = a['distance']
                return result
            } )

        // console.log( 'nearest', this.state['nearestObjects'] )

        this.state['nearestObjects']
            .forEach( a => {
              //  this.createHighlight( { 
              //      'x': a['x'], 
              //      'y': a['intersectionY'] + 5, 
            //        'z': a['y']
             //   } )
            } )



        return true
    }


    createHighlight(  ) {

        const geometry1 = new THREE.BoxBufferGeometry( 
            0.15, 2, 0.15
        )

        geometry1.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 1, 0 ) )
        const material1 = new THREE.MeshNormalMaterial( { 
            'transparent': true, 
            'opacity': 0
        } )

        // this.pos.push( new THREE.Mesh( geometry1, material1 ) )
        this.highlight = new THREE.Mesh( geometry1, material1 )

        // this.pos[ this.pos.length-1 ].position.x = cmd['flag']['position']['x']
        this.highlight.position.x = 10

        // this.pos[ this.pos.length-1 ].position.z = cmd['flag']['position']['z']
        this.highlight.position.z = 50

        // this.pos[ this.pos.length-1 ].rotateY( Math.PI )
        this.highlight.rotateY( Math.PI )

        //console.log( '>>', intersects)

        this.pointflagLight = new THREE.PointLight( 
            new THREE.Color( this.config['objects']['highlight']['point']['color'] ), 
            this.config['objects']['highlight']['point']['intensity'], 
            this.config['objects']['highlight']['point']['decay']
        )

        this.pointflagLight.position.set( 0, 0, 0 )
        this.highlight.add( this.pointflagLight )

        this.directional = new THREE.DirectionalLight( 
            new THREE.Color( this.config['objects']['highlight']['directional']['color'] ), 
            this.config['objects']['highlight']['directional']['itensity']
        )

        this.directional.position.set( 0, 0, 0 )  
        this.directional.castShadow = this.config['objects']['highlight']['directional']['castShadow']

        this.directional.target = this.pointflagLight 
        
        this.scenePerspective.add( this.highlight )
        this.scenePerspective.add( this.directional )
    }


    updateHighLight( { x, y, z } ) {
        this.highlight.position.set( x, y, z )
        this.directional.position.set( x, y, z )  
        this.pointflagLight.position.set( x, y, z )
    }


    async start() {
        await this.init()
        this.animate()
        // document.getElementById( 't2' ).remove()
        // this.animate()
    }


    async withUserName( { userName, cryptoAddress=null, cryptoChain=null } ) {
        [
            [ 'userName', userName ],
            [ 'cryptoAddress', 'cryptoAddress' ],
            [ 'cryptoChain', cryptoChain ]
        ]
            .forEach( row => {
                const [ key, value ] = row
                this.state['user'][ key ] = value
            } )

        this.state['user'] = {
            userName, 
            cryptoAddress, 
            cryptoChain
        }

        this.addWebsocket()
        this.addJoystick()
        this.addListenerKeyboard()
        this.addListenerMouse()
        loading.innerHTML = ''
    }
}



var state = { 
    'joystick': {
        'forward': 0, 
        'turn': 0 
    },
    'pos': {
        'found': false
    }
}

var walletMina = new WalletMina()
walletMina.init()
var metaverse = new Metaverse()
async function main() {
    await Promise.all( 
        [
            await metaverse.start(),
            await walletMina.init()
        ]
    )

    // metaverse.withUserName( { 'userName': `Looki-${Math.floor( Math.random()*1000 ) }` } )
    return true
}


main()
    .then( a => console.log( a ) )
    .catch( e => console.log( e ) )
