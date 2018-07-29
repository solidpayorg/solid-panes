/*   Playlist Pane
**
**  This pane allows playlists and playlists slots to be viewed
**  seeAlso: http://smiy.sourceforge.net/pbo/spec/playbackontology.html
*/
var UI = require('solid-ui')

module.exports = {
  icon: UI.icons.iconBase + 'noun_1619.svg',

  name: 'ledger',

  label: function (subject) {
    var kb = UI.store

    if (!kb.anyStatementMatching(
        subject, UI.ns.rdf('type'),
        kb.sym('https://w3id.org/cc#CreditChain'))) {
      return null
    }

    return 'playlist slot'
  },

  render: function (subject, dom, paneOptions) {
    var link = function (contents, uri) {
      if (!uri) return contents
      var a = dom.createElement('a')
      a.setAttribute('href', uri)
      a.appendChild(contents)
      return a
    }

    var text = function (str) {
      return dom.createTextNode(str)
    }

    function addRow (source, amount, destination) {
      if (source === undefined || amount === undefined || destination === undefined) {
        return
      }
      let tr1 = dom.createElement('tr') // why need tr?
      let td1 = dom.createElement('td')
      let td2 = dom.createElement('td')
      let td3 = dom.createElement('td')
      td1.innerHTML = source
      td2.innerHTML = amount
      td3.innerHTML = destination

      td1.setAttribute('style', '1px solid #ddd; padding: 8px')
      td2.setAttribute('style', '1px solid #ddd; padding: 8px; background-color: #FFFF99; font-weight: bold; color: #178817;')
      td3.setAttribute('style', '1px solid #ddd; padding: 8px')

      tr1.appendChild(td1)
      tr1.appendChild(td2)
      tr1.appendChild(td3)
      table.appendChild(tr1)
    }

    function addMenu () {
      var menu = dom.createElement('div')
      menu.appendChild(text(' | '))

      if (wallet && wallet.uri) {
        var walletLink = link(text('Wallet'), wallet.uri)
        menu.appendChild(walletLink)
        menu.appendChild(text(' | '))
        div.appendChild(menu)
      }

      if (ledger && ledger.uri) {
        var ledgerLink = link(text('Ledger'), ledger.uri)
        menu.appendChild(ledgerLink)
        menu.appendChild(text(' | '))
        div.appendChild(menu)
      }

      if (creditChain && creditChain.uri) {
        var creditChainLink = link(text('Transactions'), creditChain.uri)
        menu.appendChild(creditChainLink)
        div.appendChild(menu)
      }

      menu.appendChild(text(' | '))
      div.appendChild(dom.createElement('hr'))
    }

    var kb = UI.store
    var fetcher = kb.fetcher

    var creditChain = subject
    var me = UI.authn.currentUser()
    var balance = 0

    var wallet = kb.any(null, $rdf.sym('https://w3id.org/cc#creditChain'), subject)
    var ledger = kb.any(wallet, $rdf.sym('https://w3id.org/cc#ledger'))
    var credits = kb.statementsMatching(null, $rdf.sym('https://w3id.org/cc#amount'), null, subject)

    if (ledger && ledger.uri) {
      fetcher.load(ledger.uri)
    }
    if (creditChain && creditChain.uri) {
      fetcher.load(creditChain.uri)
    }
    if (me && me.uri) {
      fetcher.load(me.uri)
      balance = kb.any(kb.sym(me.uri), kb.sym('https://w3id.org/cc#amount'))
      if (balance) {
        balance = balance.value
      } else {
        balance = 0
      }
    }

    var td1, td2, td3, tr1
    var div = dom.createElement('div')
    addMenu()

    // add credits
    var table = div.appendChild(dom.createElement('table')) // @@ make responsive style
    table.setAttribute('style', 'color: #333 ; font-family: "Trebuchet MS", Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%')

    tr1 = dom.createElement('tr') // why need tr?
    td1 = dom.createElement('th')
    td2 = dom.createElement('th')
    td3 = dom.createElement('th')

    td1.innerHTML = 'Source'
    td2.innerHTML = 'Amount'
    td3.innerHTML = 'Destination'

    td1.setAttribute('style', '1px solid #ddd; padding: 8px; text-align: left;')
    td2.setAttribute('style', '1px solid #ddd; padding: 8px; background-color: #FFFF99; font-weight: bold; color: #178817; text-align: left;')
    td3.setAttribute('style', '1px solid #ddd; padding: 8px; text-align: left;')

    tr1.appendChild(td1)
    tr1.appendChild(td2)
    tr1.appendChild(td3)
    table.appendChild(tr1)

    for (var i = 0; i < credits.length; i++) {
      var source = kb.any(credits[i].subject, kb.sym('https://w3id.org/cc#source'))
      var destination = kb.any(credits[i].subject, kb.sym('https://w3id.org/cc#destination'))
      console.log('destination', destination);
      addRow(source.value, credits[i].object.value, destination.value)
    }

    div.appendChild(table)

    div.appendChild(dom.createElement('hr'))

    return div
  }
}

// ends
