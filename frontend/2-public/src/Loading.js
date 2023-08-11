const Loading = class Loading extends EventTarget {
    #config
    state


    constructor( { config } ) {
        super()
        this.#config = config

        return
    }


    async loadModules() {
        this.state = {
            'blob': {
                'snarkyjs': null
            },
            'modules': {
                'snarkyjs': null
            }
        }

        console.log( '  Load Modules' )

        this.#emitEvent( { 
            'eventType': this.#config['html']['statusOverall']['events']['update'],
            'detail': {
                'status': 'Load Modules...'
            }
        } )

        await Promise.all(
            Object
                .entries( this.#config['files'] )
                .map( async( a ) => {
                    const [ key, value ] = a 
                    return await this.#addFile( { key } )
                } )
        )

        console.log( '  Modules ready!' )
        this.#emitEvent( { 
            'eventType': this.#config['html']['statusOverall']['events']['update'],
            'detail': {
                'status': 'Modules ready!'
            }
        } )
        // this.#updateStatus( { 'status': 'Ready to use!' } )

        return true
    }


    async initModule( { name } ) {
        console.log( `    Init ${name}` )
        this.state['modules'][ name ] = true

        return new Promise( async( resolve, reject ) => {
            this.#emitEvent( { 
                'eventType': this.#config['html']['statusOverall']['events']['update'],
                'detail': {
                    'status': `Init ${name}...`
                }
            } )

            document.addEventListener(
                name, 
                ( event ) => {
                    this.#emitEvent( { 
                        'eventType': this.#config['html']['statusOverall']['events']['update'],
                        'detail': {
                            'status': `${name} Ready!`
                        }
                    } )
                    // console.log('Custom event triggered:', event.detail)
                    resolve( true )
            } )
    
            const script = document.createElement( 'script' )
            let scriptContent

            switch( name ) {
                case 'snarkyjs':
                    scriptContent = this.sourceCodeSnarkyjs( { 
                        'eventName': name
                    } )
                    break;
                case 'smartContract':
                    scriptContent = await this.sourceCodeSmartContract( {
                        'eventName': name
                    } )
                    break
                default:
                    console.log( `Key not found: ${name}`)
                    break
            }

            script.textContent = scriptContent
            document.head.appendChild( script )
        } )
    }


    sourceCodeSnarkyjs( { eventName } ) {
        const result =  `
var snarkyjs
async function main() {
    var tmp = await import( loading.state['blob']['snarkyjs'] )
    snarkyjs = tmp['snarkyjs']
    return true
}

main()
    .then( a => { 
        const customEvent = new CustomEvent(
            '{{eventName}}', 
            { detail: { key: 'value' } } 
        )
        document.dispatchEvent(customEvent)

        return true
        } )
    .catch( e => console.log( e ) )
    `
         .replace( '{{eventName}}', eventName ) 

         return result
    }


    async sourceCodeSmartContract( { eventName } ) {
        const blobUrl = this.state['blob']['smartContract']
        const response = await fetch( blobUrl )
        const blobData = await response.blob()
        const blobString = await blobData.text()

        let result = blobString
            .split( "\n" )
            .map( a => {
                let result = a
                const regex = /import\s*{[^}]*}\s*from\s*'snarkyjs';/g;
                const matches = a.match(regex);
                if( matches ) {
                    const str = matches[ 0 ]
                    if( str.includes( 'snarkyjs' ) ) {
                        const regex2 = /{([^}]*?)}/g;
                        const matches2 = str.match( regex2 )
                        if( matches2 ) {
                            result = `var ${matches2[ 0 ]} = snarkyjs`
                        } else {
                            console.log( `Option not found: ${str}`)
                        }
                    }
                } else if( result.startsWith('export class ') ) {
                    result = `class ${result.split( 'export class ' )[ 1 ]}`
                }

                return result
            } )
            .join( "\n" )

        const insert = `
const customEvent = new CustomEvent(
    '{{eventName}}', 
    { detail: { key: 'value' } } 
)
document.dispatchEvent(customEvent)    
`
    .replace( '{{eventName}}', eventName )

        result += "\n"
        result += insert

        return result
    }



    #emitEvent( { eventType, detail } ) {
        const event = new CustomEvent(
            eventType, 
            { detail }
        )
        document.dispatchEvent( event )

        return true
    }


    async #addFile( { key } ) {
        const result = await this.#loadFile( {
            'url': this.#config['files'][ key ],
            'key':  key 
        } )
        this.state['blob'][ key ] = result

        return true
    }


    async #loadFile( { url, key } ) {
        return new Promise( ( resolve, reject ) => {
            const xmlHTTP = new XMLHttpRequest()
            xmlHTTP.open( 'GET', url, true )
            xmlHTTP.responseType = 'arraybuffer'

            xmlHTTP.onload = ( e ) => {
                const blob = new Blob( 
                    [ xmlHTTP.response ], 
                    { 'type': 'application/javascript' }
                )
                const localUrl = URL.createObjectURL( blob )
                return resolve( localUrl )
            }

            xmlHTTP.onprogress = ( e ) => {
                const loaded = e.loaded
                const total = e.total
                const progress = ( loaded / total ) * 100
                console.log( `    Progress: ${key}, ${progress}`)

                this.#emitEvent( {
                    'eventType': this.#config['html']['progressBars']['events']['update'],
                    'detail': {
                        'fileKey': key,
                        'value': progress
                    }
                } )
            }

            xmlHTTP.onerror = ( e ) => {
                reject( new Error( 'Error loading module' ) )
            }

            xmlHTTP.send()
        } )
    }
}