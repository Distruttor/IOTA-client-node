// Require the use of IOTA library
const IOTA = require("iota.lib.js") 
const ccurl = require('ccurl.interface.js')

var iota = new IOTA({
    'provider': 'http://node01.iotatoken.nl:14265'
});


const seed = "LZAXASHEXEBOQPEMCFAIVRQJDWNSHNIEVABQJTETROFHXNKUPIPKPRIBH9MOFCXQAWEHZB9XNBZZGBVZJ";
const depth = 3;
const minimumWeightMagnitude = 14;

const options = [
	{
		'security': 1
	}
]
iota.api.getNewAddress(seed, options,(error, address) => {
    console.log("New address generated: " + address)
    const msg = iota.utils.toTrytes("Prova inserimento transaction");
    const transfer = [{
        address: address,
        value: 0,
        message: msg,
        tag: 'MIRKO'
    }]

    iota.api.prepareTransfers(seed,transfer,(error,response) => {
        if(error) {
            console.log(error);
        } else {
            //Get the transaction object from trytes
            var transaction = iota.utils.transactionObject(response[0]);

            console.log(transaction);
            console.log('\n')

            //Get two transactions to approve
            iota.api.getTransactionsToApprove(depth,null,(error, response) => {
                if(error) {
                    console.log(error);
                } else {
                    console.log(response)
                    console.log('\n')
                    //Update transaction trunk a branch value
                    transaction.trunkTransaction = response.trunkTransaction;
                    transaction.branchTransaction = response.branchTransaction;

                    console.log(transaction)
                    console.log('\n')
                    //Reconvert transaction to trytes
                    var trytes = iota.utils.transactionTrytes(transaction);

                    //PoW to find the nonce
                    const path = "./"
                    const job = ccurl(transaction.trunkTransaction,transaction.branchTransaction,minimumWeightMagnitude,[trytes],path);
                    job.on('progress', (err, progress) => {
                        if(err) {
                            console.log(err)
                        } else {
                            console.log(progress) // A number between 0 and 1 as a percentage of `trytes.length`
                        }
                        
                    })

                    job.on('done', (e,success) => {
                        if(e) {
                            console.log(e)
                        } else {
                            //Broadcast the transaction with nonce to the tangle                          
                            iota.api.broadcastTransactions(success,(error, res) => {
                                if(error) {
                                    console.log(error)
                                } else {
                                    console.log(res)
                                }
                            })
                        }
                        
                    })

                    job.start()
                }
            })
        }
    })
    
})