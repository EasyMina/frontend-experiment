const ui = new UI()


const Step = class Step extends EventTarget {
    #config
    #state
    state


    constructor() {
        super()
        this.#config = {
            'validNetworks': [ 'devnet', 'berkeley', 'testworld2', 'mainnet' ]
        }
    }


    init() {
        this.#state = {
            'auro': {
                'exists': false,
                'account': null,
                'network': null
            }
        }

        return true
    }


    getState() {
        return this.#state
    }


    async connectToAuro() {
        const validation = await this.#validateConnectToAuro()
        const [ messages, comments, accounts, network ] = validation
        this.#printMessages( { messages, comments } )
        this.#state['auro']['exists'] = messages.length === 0 ? true : false
        if( !this.#state['auro']['exists'] ) { 
            console.log( 'AAA' )
            ui.updateAuro( { 
                'message': messages.join( ' ' ), 
                'state': 'failed' 
            } )
            return true 
        }

        this.#state['auro']['account'] = accounts[ 0 ]
        if( network['chainId'] !== 'mainnet' ) {
            const targetChain = 'mainnet'
            await mina.switchChain( { 'chainId': targetChain } )
            const newNetwork = await mina.requestNetwork()
            console.log( `Change chainId to '${newNetwork['chainId']}'.` )
            this.#state['auro']['network'] = newNetwork['chainId']
        } else {
            this.#state['auro']['network'] = network['chainId']
        }

        const message = `Account: ${this.#state['auro']['account']}, Network: ${this.#state['auro']['network']}.`

        ui.health()
        ui.updateAuro( { message, state: 'success' } )
    }


    async #validateConnectToAuro() {
        const messages = []
        const comments = []
        let accounts
        let network

        if( typeof mina === 'undefined' ) {
            messages.push( `Auro Wallet is not available.` )
        }

       if( messages.length === 0 ) {
            try {
                accounts = await mina.requestAccounts()
            } catch( e ) {
                messages.push( `Auro .requestAccounts() failed. ${e}` )
            }

            try {
                network = await mina.requestNetwork()
            } catch( e ) {
                messages.push( `Auro .requestNetwork() failed. ${e}` )
            }

            if( !Array.isArray( accounts ) ) {
                messages.push( `Account is not array.` )
            } else if( accounts.length === 0 ) {
                messages.push( `Not account connected.` ) 
            } else {
                comments.push( `${accounts.length} Account${accounts.length === 0 ? '' : 's' } connected (${accounts.join( ', ' )}).`)
            }

            if( typeof network !== 'object' ) {
                messages.push( `Network is not object.` )
            } else if( !network.hasOwnProperty( 'chainId' ) ) {
                messages.push( `Network has not the key 'chainId'.` ) 
            } else if( !this.#config['validNetworks'].includes( network['chainId'] ) ) {
                messages.push( `Network with the value '${network}' is not valid.` )
            } else {
                comments.push( `Network is set to ${network['chainId']}.` )
            }
       }

        return [ messages, comments, accounts, network ]
    }


    #printMessages( { messages=[], comments=[] } ) {
        const n = [
            [ comments, 'Comment', false ],
            [ messages, 'Error', true ]
        ]
            .forEach( ( a, index ) => {
                const [ msgs, headline, stop ] = a
                msgs
                    .forEach( ( msg, rindex, all ) => {
                        rindex === 0 ? console.log( `\n${headline}${all.length > 1 ? 's' : ''}:` ) : ''
                        console.log( `  - ${msg}` )
                        if( ( all.length - 1 ) === rindex ) {
                            if( stop === true ) {

                            }
                        }
                    } )
            } )
    
        return true
    }
}