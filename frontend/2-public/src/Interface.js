const Interface = class Interface extends EventTarget {
    #config


    constructor( { config } ) {
        super()
        this.#config = config

        return
    }


    loadModules() {
        this.#addModuleProgress()
        this.#addListener()

        return true
    }


    initializeModules() {
        console.log( '    Initialize' )
        this.#addImportProgress()
        return true
    }


    addCompileButton() {
        const element = document.getElementById( this.#config['html']['root'] )

        const tmp = document.createElement( 'button' )
        tmp.id = this.#config['html']['compileButton']['elements']['button']['id']
        tmp.innerHTML = 'COMPILE'
        element.appendChild( tmp )

        return true
    }


    #addImportProgress() {
        const element = document.getElementById( this.#config['html']['root'] )

        const tmp = document.createElement( 'button' )
        tmp.id = this.#config['html']['importButton']['elements']['button']['id']
        tmp.innerHTML = 'IMPORT MODULES'
        element.appendChild( tmp )

        const tmp2 = document.createElement( 'span' )


        element.appendChild( tmp2 )

        return true
    }


    #addListener() {
        document.addEventListener(
            this.#config['html']['progressBars']['events']['update'], 
            ( event ) => {
                const { fileKey, value } = event.detail
                this.#updateProgressBar( { fileKey, value } )
            } 
        )

        document.addEventListener(
            this.#config['html']['statusOverall']['events']['update'], 
            ( event ) => {
                const { status } = event.detail
                this.#updateStatusText( { status } )
            } 
        )
    }


    #addModuleProgress() {
        const root = document.getElementById( this.#config['html']['progressBars']['root'] )

        Object
            .entries( this.#config['files'] )
            .forEach( a => {
                const [ key, value ] = a 

                const ids = Object
                    .entries( this.#config['html']['progressBars']['elements'] )
                    .reduce( ( acc, b, index ) => {
                        const [ _key, _value ] = b
                        const { id } = _value
                        acc[ _key ] = this.#config['html']['progressBars']['elements'][ _key ]['id']
                            .replace( '{{key}}', key )
        
                        return acc
                    }, {} )

                const progressBarContainer = document.createElement( 'div' )
                progressBarContainer.id = ids['container']

                const progressBar = document.createElement( 'progress' )
                progressBar.className = this.#config['html']['progressBars']['elements']['progressBar']['className']
                progressBar.id = ids['progressBar']
                progressBar.max = 100
                progressBar.value = 0

                const progressText = document.createElement( 'span' )
                progressText.className = this.#config['html']['progressBars']['elements']['progressText']['className']
                progressText.id = ids['progressText']
                progressText.textContent = `${key}: 0%`     

                progressBarContainer.appendChild( progressBar )
                progressBarContainer.appendChild( progressText )

                root.appendChild( progressBarContainer )
            } )

        return true
    }


    #updateStatusText( { status } ) {
        const element = document.getElementById( this.#config['html']['statusOverall']['id'] )
        element.innerHTML = status

        return true
    }


    #updateProgressBar( { fileKey, value } ) {
        const n = [
            'Bar',
            'Text'
        ]
            .forEach( type => {
                const element = document
                    .getElementById( `${fileKey}${type}`)
                switch( type ) {
                    case 'Bar':
                        element.value = value
                        break
                    case 'Text':
                        element.innerHTML = `${fileKey}: ${value}%`; 
                        break
                    default:
                        console.log( `Type ${type} not found.` )
                        break
                }
            } )

        return true
    }
}