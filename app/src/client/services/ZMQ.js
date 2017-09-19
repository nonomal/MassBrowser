/**
 * Created by milad on 6/28/17.
 */
import { Session } from '@/net/Session'
import { connectionManager } from '@/net/connectionManager'

let REQUEST_ZMQ_SERVER = 'tcp://127.0.0.1:5560'
let RESULTS_ZMQ_SERVER = 'tcp://127.0.0.1:5558'
const zeromq = require('zeromq')
class _ZMQListener {
  constructor () {
    this.requests = zeromq.socket('pull')
    this.results = zeromq.socket('push')
    this.validSessions = new Set()
  }

  connect () {
    this.requests.connect(REQUEST_ZMQ_SERVER)
    this.requests.on('message', (msg) => {
      this.onRequest(msg)
    })
    this.results.connect(RESULTS_ZMQ_SERVER)
    console.log('Connected TO ZMQ servers')
  }

  onRequest (data) {
    let session = JSON.parse(data.toString())
    console.log(session)
    var desc = {
      'readkey': Buffer.from(session.read_key, 'base64'),
      'readiv': Buffer.from(session.read_iv, 'base64'),
      'writekey': Buffer.from(session.write_key, 'base64'),
      'writeiv': Buffer.from(session.write_iv, 'base64'),
      'token': Buffer.from(session.token, 'base64')
    }
    this.validSessions.add(session)
    var _session = new Session(session.id, session.relay.ip, session.relay.port, desc, session.relay['allowed_categories'])
    _session.connect().then(() => {
      console.log('Session Connected')
      connectionManager.testConnect(session.destination.dst, session.destination.port, _session.connection, () => {
        if (this.validSessions.has(session)) {
          this.validSessions.delete(session)
          _session.connection.end()
          this.onConnect(session)
        }
      }, () => {
        if (this.validSessions.has(session)) {
          this.validSessions.delete(session)
          _session.connection.end()
          this.onDisconnect(session)

        }
      })
    }).catch((err) => {
      if (this.validSessions.has(session)) {
        this.validSessions.delete(session)
        this.onDisconnect(session)

      }
    })
  }

  onDisconnect (session) {
    session['is_reachable'] = false

    console.log(session, 'is not reachable')
    this.results.send(JSON.stringify(session))
  }

  onConnect (session) {
    session['is_reachable'] = true
    console.log(session, 'is reachable')
    this.results.send(JSON.stringify(session))
  }

}
var ZMQListener = new _ZMQListener()
export default ZMQListener
