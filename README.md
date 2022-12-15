<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/custom/mina-zk-ignite-cohort-0.svg" height="45px" alt="Proof-of-playing" name="# Proof-of-playing">
</a>

*This repo contains*
- Backend Server (express)
- Rest Api (mina signature)  
  /getStandings, /challenge/* (get, post)
- Websocket provider
- 3D Frontend (three.js)

*Mina Smart Contract and Tooling*
- https://github.com/a6b8/mina-zk-ignite-cohort-0-smart-contracts fork of https://github.com/a6b8/easy-mina-for-nodejs

*Mina Blockchain*
- Contract: https://berkeley.minaexplorer.com/wallet/B62qiUdy93cmB9rcQjie2Zo8TwHDiZnmEmJejiXVb2dEADyez2QW6M1


This submission shows a possible usecase for off-chain oracles in games with zero knowledge proofs. 

The goal is to give the users a receipt for thier earned points. Important is to not disturb the game with loading.

Procedure:
- the user set a name
- if `auro wallet` is detected the users will be forced to connect the wallet.
- games begins and the users try to catch sprites and earn points
- if the user has 10 points and `auro wallet` installed the `auro wallet` pops up.
- the users get informed that´s eligable for a `proof-of-playing`.
- After signing the message, the browser requests a mina signature from the server.
- After receiving the signature, automatically get downloaded as a textfile.

<br>

<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/examples.svg" height="45px" alt="Examples" name="examples">
</a>

1. Demo
> https://jellyfish-app-iig6c.ondigitalocean.app/?x=-216&y=30&z=-40



<a href="#headline">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/table-of-contents.svg" height="45px" name="table-of-contents" alt="Table of Contents">
</a>
<br>

1. [Examples](#examples)<br>
2. [Setup](#setup)
3. [Config](#config)<br>
4. [Contributing](#contributing)<br>
5. [Limitations](#limitations)<br>
6. [Credits](#Credits)<br>
7.  [License](#license)<br>
8.  [Code of Conduct](#code-of-conduct)<br>
9.  [Support my Work](#support-my-work)<br>

<br>

<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/setup.svg" height="45px" name="setup" alt="Setup">
</a>

1. setup .env
```
MINA_SERVER_PUBLIC=BK...
MINA_SERVER_PRIVATE=EKE...
```

2. install packages
```
npm install
node index.js
```


3. use ngrok (optional)

run ngrok find url
```
./ngrok http 3000
```

update `this.config['environment']['url']['local']`
```
    this.config = {
        'env': '.env',
        'environment': {
            'current': null,
            'url': {
                'current': null,
                'local': <----- HERE
            }
```


4. run server
```
node index.js
```


<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/config.svg" height="45px" alt="Config" name="config">
</a>  


`src/Server.js`

```js
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

```


`./public/src/index.js`

```js
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
```


<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/contributing.svg" height="45px" alt="Contributing" name="contributing">
</a>

Bug reports and pull requests are welcome on GitHub at https://github.com/a6b8/easy-mina. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [code of conduct](https://github.com/a6b8/easy-mina/blob/master/CODE_OF_CONDUCT.md).

<br>

<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/limitations.svg" height="45px" name="limitations" alt="Limitations">
</a>

- Proof of Concept, not battle-tested.

<br>

<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/credits.svg" height="45px" name="credits" alt="Credits">
</a>

EasyMina is based on the examples of jackryanservia
- jackryanservia/oracle-example https://github.com/jackryanservia/oracle-example
- jackryanservia/mina-credit-score-signer https://github.com/jackryanservia/mina-credit-score-signer

<br>

<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/license.svg" height="45px" alt="License" name="license">
</a>
s
<br>

<a href="#table-of-contents">
<img src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/code-of-conduct.svg" height="45px" alt="Code of Conduct" name="code-of-conduct">
</a>

Everyone interacting in the AsciiToSvg project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/a6b8/easy-mina/blob/master/CODE_OF_CONDUCT.md).

<br>

<a href="#table-of-contents">
<img href="#table-of-contents" src="https://raw.githubusercontent.com/a6b8/a6b8/main/assets/headlines/default/star-us.svg" height="45px" name="star-us" alt="Star us">
</a>

Please ⭐️ star this Project, every ⭐️ star makes us very happy! 








