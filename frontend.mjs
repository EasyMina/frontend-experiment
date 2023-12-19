
import fs from 'fs'
import express from 'express'


const Frontend = class Frontend {
    #config
    #state
    #server
    #silent

    constructor() {
        this.#config = {
            'preloads': {
                'contract': {
                    'path': './frontend/0-easymina/default--1690937134.json',
                    'jsonKey': 'data__smartContract__content',
                },
                'snarkyjs': {
                    'path': './frontend/1-webpack/1-build/snarkyjs.mjs',
                },
                'index': {
                    'path': './frontend/2-public/index-v2.html',
                },
                'loading': {
                    'path': './frontend/2-public/src/Loading.js',
                },
                'interface': {
                    'path': './frontend/2-public/src/Interface.js',
                }
            },
            'server': {
                'port': 3000,
                'headers': [
                    [ 'Cross-Origin-Opener-Policy', 'same-origin' ],
                    [ 'Cross-Origin-Embedder-Policy', 'require-corp' ]
                ],
                'routes': [
                    {
                        'route': '/data/smartContract.mjs',
                        'headers': [ [ 'Content-Type', 'application/javascript' ] ],
                        'type': null,
                        'send': 'preloads__contract'
                    },
                    {
                        'route': '/data/snarkyjs.mjs',
                        'headers': [ [ 'Content-Type', 'application/javascript' ] ],
                        'type': '.js',
                        'send': 'preloads__snarkyjs'
                    },
                    {
                        'route': '/',
                        'headers': [ [ 'Content-Type', 'text/html' ] ],
                        'type': null,
                        'send': 'preloads__index'
                    },
                    {
                        'route': '/src/Loading.js',
                        'headers': [ [ 'Content-Type', 'application/javascript' ] ],
                        'type': '.js',
                        'send': 'preloads__loading'
                    },
                    {
                        'route': '/src/Interface.js',
                        'headers': [ [ 'Content-Type', 'application/javascript' ] ],
                        'type': '.js',
                        'send': 'preloads__interface'
                    }
                ]
            }
        }

        return true
    }


    async init( silent=false ) {
        this.#state = {
            'preloads': {}
        }

        this.#silent = silent

        !this.#silent ? console.log( 'SERVER' ) : ''
        !this.#silent ? console.log( '------' ) : ''
        !this.#silent ? console.log( '  Add Files' ) : ''
        await this.#addPreloads()

        this.#addServer()

        !this.#silent ? console.log( '    Add Routes' ) : ''
        this.#addServerRoutes()

        return true
    }


    start() {
        !this.#silent ? console.log( '  Start Server' ) : ''
        !this.#silent ? console.log( '    Routes' ) : ''
        this.#server.listen( 
            this.#config['server']['port'], 
            () => {
                this.#config['server']['routes']
                    .forEach( a => {
                        const { route } = a
                        console.log( `    - http://localhost:${this.#config['server']['port']}${route}` )
                    } )
            } 
        )
    }


    #addServer() {
        !this.#silent ? console.log( '  Add Server' ) : ''
        this.#server = express()

        !this.#silent ? console.log( '    Add Use' ) : ''
        this.#server.use( ( req, res, next ) => {
            this.#config['server']['headers']
                .forEach( ( cmd ) => res.setHeader( cmd[ 0 ], cmd[ 1 ] ) )
            next()
        } )
    }


    async #addPreloads() {
        await Promise.all(
            Object
                .entries( this.#config['preloads'] )
                .map( async( a, index ) => {
                    const [ name, value ] = a
                    const { path } = value

                    if( Object.hasOwn( value, 'jsonKey' ) ) {
                        const raw = JSON.parse(
                            fs.readFileSync( path, 'utf-8' )
                        )

                        this.#state['preloads'][ name ] = 
                            this.#keyPathToValue( { 'data': raw, 'keyPath': value['jsonKey'] } )
                    } else {
                        this.#state['preloads'][ name ] = 
                            fs.readFileSync( path )
                    }
                } )
        )

        return true
    }


    #addServerRoutes() {
        this.#config['server']['routes']
            .forEach( a => {
                const { route, headers, type, send } = a 
                this.#server.get( 
                    route,
                    ( req, res ) => {
                        headers.forEach( header => res.setHeader( header[ 0 ], header[ 1 ] ) )
                        type !== null ? res.type( type ) : ''
                        res.send( this.#keyPathToValue( { 'data': this.#state, 'keyPath': send } ) )
                    }    
                )

            } )
    }


    #keyPathToValue( { data, keyPath, separator='__' } ) {
        if( typeof keyPath !== 'string' ) {
            console.log( `KeyPath is not a string (${keyPath})`)
            return undefined
        }
    
        const result = keyPath
            .split( separator )
            .reduce( ( acc, key, index ) => {
                if( !acc ) return undefined
                if( !acc.hasOwnProperty( key ) ) return undefined
                acc = acc[ key ]
                return acc
            }, data )
    
        return result
    }
}


const frontend = new Frontend()
await frontend.init()
frontend.start()





