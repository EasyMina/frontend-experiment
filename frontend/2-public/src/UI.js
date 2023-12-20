const UI = class UI extends EventTarget {
    #config
    state


    constructor() {
        super()
        this.#config = {
            'auro': {
                'id': 'auro'
            },
            'button':{
                'waiting': 'button waiting',
                'inProgress': 'button inProgress',
                'success': 'button success',
                'failed': 'button failed'
            }
        }
    }


    updateAuro( { message, state } ) {
        console.log( 'B', state )
        const id = this.#config['auro']['id']
        this.#modifyStatus( { id, message } )

        const text = state
        this.#modifyButton( { id, state, text } )


        return true
    }


    health() {
        console.log( 'UI ready' )
    }



    #modifyStatus( { id, message } ) {
        const root = document.getElementById( id )
        if( root ) {
            const second = root.getElementsByTagName( 'td' )[ 1 ]
            if( second ) {
              console.log( second.textContent )
              second.textContent = message
            } else {
              console.error( `Second <td> element not found in the <tr>.` )
            }
        } else {
            console.error( `The <tr> element with id '${id}' was not found.` )
        }
    }


    #modifyButton( { id, state, text } ) {
        console.log( 'c', state )
        if( !Object.keys( this.#config['button'] ).includes( state ) ) {
            console.log( `State with the value '${state}' is not known.` )
        }

        const root = document.getElementById( id )
        if( root ) {
            const third = root.getElementsByTagName( 'td' )[ 2 ]
            if( third ) {
                console.log( 'HERE ', state )
                const button = third.querySelector( 'button' )
                button.className = this.#config['button'][ state ]
                button.textContent = text
            } else {
              console.error( `Third <td> element not found in the <tr>.` )
            }
        } else {
            console.error( `The <tr> element with id '${id}' was not found.` )
        }
    }
}